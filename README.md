# EduLint for VS Code

This extension runs the `python3 -m edulint check <file>` shell command with the .py file you have just open in VS Code.

## Usage

You can either run the command `EduLint: Run Linting` from the Command Palette or click on the (eye) EduLint button located in the bottom right corner of VS Code.

## Requirements

- Python 3 
- Microsoft Python Extension ([available here](https://marketplace.visualstudio.com/items?itemName=ms-python.python))
- EduLint v4.x as a Python package 

You can install edulint by running the command:

```sh
python3 -m pip install --user edulint~=4.0
```

## Resources

* [EduLint GitHub Repo](https://github.com/GiraffeReversed/edulint)
* [Microsoft Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
* [Python Releases](https://www.python.org/downloads/)