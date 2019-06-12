# LaTeX syntax structures
This file is a part of [**TeXnous project**](http://texnous.org).

This repository provides a library with a set of structures to handle LaTeX syntax definitions.

## Structure of the repository
There are several files for the meta purposes:

- **package.json** describes this repository for the npm framework.
- **license.\*.md** contain the full texts of the licenses.
- **.eslintrc.json** contains the rules for the linter.
- **readme.md** is this description.

And there are two directories:

- **sources** contains the source code.
- **tests** contains unit tests, it's unavailable for npm module.

The content of these directories is arranged exactly the same way, files with the same relative paths correspond to each other.

- **lib** is the directory with libraries implementing all logic.
	- **LatexSyntax.js** contains LaTeX syntax structures.
- **index.js** is the main exported file.

## Installing
The corresponding node module can be installed with

```npm install --save @texnous/latex-syntax```

## Developer scripts
Please use the following scripts to work with the repository:

- ```npm run linting``` to call the linter.
- ```npm run testing``` to call the unit tests.
