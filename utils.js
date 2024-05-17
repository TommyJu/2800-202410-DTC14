
// We can import and use these two functions in our code

global.base_dir = __dirname;
global.abs_path = function(path) {
	return base_dir + path;
}

// Creates a wrapper around require that ensures that the path is relative to base directory
global.include = function(file) {
	return require(abs_path('/' + file));
}