# EduLint for VS Code

This extension runs the `python3 -m edulint <file>` shell command with the .py file you have just open in VS Code.

This solution is temporary. I plan to migrate to [Language Server](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) for a better DX.

## Usage

You can either run the command `EduLint: Run Linting` from the Command Palette or click on the (eye) EduLint button located in the bottom right corner of VS Code.

## Requirements

- Python 3 (have `python3` command point to it)
- EduLint as a Python package

You can install it by running the command:

```sh
python3 -m pip install --user edulint
```

## Resources

* [EduLint GitHub Repo](https://github.com/GiraffeReversed/edulint)
* [Python Releases](https://www.python.org/downloads/)
