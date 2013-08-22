(->
  class FormNamesStack

    constructor: () ->
      @stack = []

    push: (name) ->
      @stack.push(name)

    pop: () ->
      @stack.pop()

    join: () ->
      @stack.join()

    shift: () ->
      @stack.shift()

    unshift: () ->
      @stack.unshift()

    isRoot: () ->
      @stack.length == 1

    isEmpty: () ->
      @stack.length == 0

    length: () ->
      @stack.length

    clone: () ->
      @stack.slice(0)


  FORM_NAMES_STACK = new FormNamesStack()

  class FormHelper
    @render = (context, name, hb_options, options) ->
      fh = new FormHelper(context, name, hb_options, options)
      fh.render()

    constructor: (@context, @name, @hb_options, options) ->
        
        input_options   = hb_options.hash
        value_method    = input_options.value_method
        value_property  = input_options.value_property
        delete input_options.value_method
        delete input_options.value_property

        label_param     = options.label_param     || "label"
        reserved_params = options.extract || []
        @_render_fn     = options.render
        @_yield         = options.yield

        @label = input_options[label_param]
        delete input_options[label_param]

        for reserved in reserved_params
          @[reserved] = input_options[reserved]
          delete input_options[reserved]

        if input_options["class"]? && typeof input_options["class"] is "string"
          input_options["class"] = input_options["class"].split(new RegExp(" +"))
        
        if value_method?
          @value = context[value_method].call(context)
        
        else if value_property?
          @value   = context[value_property]
        
        else
          @value   = context[name]

        @value ?= "" 

        @attrs   = input_options

        @_computeNameAndIdAttribute()


    isRoot: () ->
      FORM_NAMES_STACK.isRoot()

    render: () ->

      if @_yield
        FORM_NAMES_STACK.push(@name)
        block_val = @hb_options.fn( @value )
        FORM_NAMES_STACK.pop()

      retval = @_render_fn.apply(@, [block_val])
      new Handlebars.SafeString(retval)

    _computeNameAndIdAttribute: () ->
      if !@_yield
        fns = FORM_NAMES_STACK.clone()
        fns.push(@name)

        if !@attrs.id?
          @attrs.id = fns.join( "_" )

        if !@attrs.name?
          @attrs.name = fns.shift()

          if fns.length > 0
            @attrs.name = @attrs.name + "[" + fns.join( "][" ) + "]"

    attributes: (cursor) ->
      ary = []
      for k, v of @attrs
        if k == "class"
          ary.push "class=\"#{v.join(' ')}\""
        if cursor? and k == "id"
          ary.push "#{k}=\"#{v}_#{cursor}\""
        else
          ary.push "#{k}=\"#{v}\""

      ary.join(" ")


  class CollectionFormHelper extends FormHelper

    @render = (context, name, hb_options, options) ->
      fh = new CollectionFormHelper(context, name, hb_options, options)
      fh.render()

    constructor: (context, name, hb_options, options) ->

      options.extract ?= []
      for i in [ "collection", "selected", "collection_value", "collection_label", "blank", "default" ] 
        options.extract.push(i)

      hb_options.hash.collection_value = hb_options.hash.collection_value || 0
      hb_options.hash.collection_label = hb_options.hash.collection_label || 1

      super( context, name, hb_options, options )

      # Makes @original_collection contain the collection passed as parameter
      # while @collection is a list of normalized items having #label, #value and #selected properties

      @collection ?= []
      @original_collection = @collection
      @collection = []

      @selected ?= @value

      if options.multiple
        @attrs.name = @attrs.name + "[]"
      

      #
      # Treats everithing as a multiple selection
      # 

      if !$.isArray(@selected)
        @selected = if @selected?
          [@selected]
        else
          []

      if !$.isArray(@default)
        @default = if @default?
          [@default]
        else
          []

      #
      # Normalize collection elements
      #

      default_idx = []
      selected_idx = []
      i = 0

      for item in @original_collection
        e = {}
        if typeof item is 'object'
          e.label = item[@collection_label]
          e.value = item[@collection_value]
        else
          e.label = item
          e.value = item

        if $.inArray(e.value, @selected)  != -1
          selected_idx.push(i)

        if $.inArray(e.value, @default) != -1
          default_idx.push(i)

        @collection.push(e)
        i+=1

      if selected_idx.length == 0
        selected_idx = default_idx

      if selected_idx.length > 0
        for idx in selected_idx      
          e = @collection[idx]
          e.selected = true

  FormHelpers =

    # /*================================
    # =            Fieldset            =
    # ================================*/
    
    fieldset: (name, options) ->
    
      FormHelper.render @, name, options,
        label_param: "legend"
        yield: true
        render: (block) ->

          if @isRoot
            label_elem   = "legend"
            wrapper_elem = "fieldset"
          else
            label_elem   = "div"
            wrapper_elem = "div"

          legend_html = if @label?
            "<legend class='legend'>#{@label}</legend>"
          else
            ""

          """
            <#{wrapper_elem} #{@attributes()}>
            #{legend_html}
            #{block}
            </#{wrapper_elem}>
          """


    # /*==============================
    # =            Select            =
    # ==============================*/

    select: (name, options) ->

      CollectionFormHelper.render @, name, options,
        multiple: options.hash.multiple
        render: ->
          res = "<select #{@attributes()}>"
          
          if @blank?
            res += "<option value=''>#{blank}</option>"

          for item in @collection
            res += "<option value='#{item.value}'" 
            if item.selected
              res += " selected='selected'"
            res += ">#{item.label}</option>"
          
          res += "</select>"       
          res


    # /*==================================
    # =            Select Day            =
    # ==================================*/

    select_day: (name, options) ->
      options.hash.collection = [1..31]
      Handlebars.helpers.select.apply(this, [name, options])

    # /*==================================
    # =            Select Month          =
    # ==================================*/

    select_month: (name, options) ->
      options.hash.collection = [1..12]

      Handlebars.helpers.select.apply(this, [name, options])


    # /*==================================
    # =            Select Year           =
    # ==================================*/

    select_year:  (name, options) ->

      now = new Date()
      startYear = options.hash.startYear || now.getFullYear() - 50
      endYear   = options.hash.endYear   || now.getFullYear() + 50

      delete options.hash.startYear
      delete options.hash.endYear

      options.hash.collection = [startYear..endYear]

      Handlebars.helpers.select.apply(this, [name, options])

    # /*==================================
    # =            Checkboxes            =
    # ==================================*/
    
    checkboxes: (name, options) ->
      
      CollectionFormHelper.render @, name, options,
        multiple: true
        render: ->

          res = "<div>"
          i = 0
          for item in @collection
            i+=1

            res += "<div><label for=\"#{@attrs.id}_#{i}\" >"
            res += "<input type=\"checkbox\" value='#{item.value}' #{@attributes(i)}"
            
            if item.selected
              res += " checked='checked'"

            res += " /> #{item.label}</label></div>"

          res += "</div>"
          res


    checkbox: (name, options) ->

    # /*================================
    # =            Textarea            =
    # ================================*/
    
    textarea: (name, options) ->
      FormHelper.render @, name, options,
        render: ->
          res =   ""
          if @label?
            res += "<label class=\"control-label\" for=\"#{@attrs.id}\">#{@label}</label>"
          
          res +=  "<div class=\"controls\">"
          res +=  "   <textarea #{@attributes()}>#{@value}</textarea>"
          res +=  "</div>"



    # /*=============================
    # =            Input            =
    # =============================*/

    input: (name, options) ->
      FormHelper.render @, name, options,
        render: ->
          res =   ""
          if @label?
            res += "<label class=\"control-label\" for=\"#{@attrs.id}\">#{@label}</label>"
          
          res +=  "<div class=\"controls\">"
          res +=  "   <input #{@attributes()} value=\"#{@value}\" />"
          res +=  "</div>"


  for k, v of FormHelpers
    Handlebars.registerHelper k, v
)(Handlebars)