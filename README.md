Website template
===

This is a template to just simply make you up and running. It supports:
* jade files
* stylus files
* coffee files
* image compression
* bower plugins

It compiles, concatenates, minifies this files and puts them into temp and public folders. Just compiled files it puts in the temp directory, and compiled, concatenated and minified files are placed in the public folders with the names `bundle` and `bundle.min`. Note that it concatenates all the .css and compiled .styl files into one file. The same is true for .coffee and .js files, but .jade and .html files are go separately, so try to not to use the same .jade and .html file names.

To use it you need to have npm, bower and git software installed in your system.

Also you should be aware of that this template will install the latest version of jquery, bootstrap, and modernizr as soon as you run the "bower i" command in your terminal. To modify that, just edit bower.json file. Note that jquery isn't present due to it comes bundled with bootstrap already.

To quick start, just choose the folder you want the website to be in, and execure
```
git clone https://github.com/Andylime/website-template.git && cd website-template && npm i && bower i && gulp
```
After gulp initialized, your website will be available at localhost:9000 with the root at the public folder.

Well, I know this template isn't perfect, it just can't be. But I wrote it to make `my` life easier. So, if you find it helpful, feel free to use it in your projects.

That's it. Thanks for reading.