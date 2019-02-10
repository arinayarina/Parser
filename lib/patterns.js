/**
 * @return {boolean}
 */
function ImgPatern (str) { // ![Alt text](/path/to/img.jpg "Optional title")
    let reg = new RegExp('^![\\[][\\w\\d\\r\\t ]*[\\]][\\(][\\w\\d\\r\\t \\/\\. \\"]*[\\)]');

    return  reg.test(str);
}


console.log(ImgPatern("![]()"));