if (typeof global !== 'undefined') {
  if (global.Minigap == null) {
    global.Minigap = {
      setRuntime: function(runtime) {
        return global.Minigap = runtime;
      }
    };
  }
}

if (typeof window !== 'undefined') {
  if (window.Minigap == null) {
    window.Minigap = {
      setRuntime: function(runtime) {
        return window.Minigap = runtime;
      }
    };
  }
}
