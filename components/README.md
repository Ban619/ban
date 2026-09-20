# Y Components

These files are a small, allocation-free C11 component layer for the Y language.

- `assertion.c` provides structured boolean and text assertions.
- `modal.c` parses `try:`, `try<name>:`, `catch:`, and `finally:` headers.
- `iteration/ar.c` implements the `para<variable<count>>` counter from `1` through `count`.

Example GCC check from the `components` directory:

```text
gcc -std=c11 -Wall -Wextra -Werror -c assertion.c modal.c iteration/ar.c
```

The complete C and C++ validation command is available through the plain-text `Makefile`:

```text
make check
```

The components are independent of the .NET shell for now, so they can be embedded in a future native runtime without changing their public APIs.

`YModal.name` is a non-owning span into the original header. Use `name_length` when reading a `try<name>:` name; the component does not allocate or copy strings.

## Surface blocks

The `blocks` directory is the interface/surface layer:

- `rend.cpp` provides a character surface, text, boxes, and ANSI output.
- `ui.cpp` provides labels, buttons, text fields, and input events.
- `gui.cpp` composes controls, dispatches events, and renders the surface.

The surface theme is intentionally black with a restrained glass treatment: near-black panel fills, cool translucent-style borders, cyan accent edges, and muted secondary text. `ansiOutput()` emits the ANSI color sequences; `textOutput()` remains plain text for logs and tests.

Build the surface layer with C++17:

```text
gcc -x c++ -std=c++17 -Wall -Wextra -Werror -Iblocks -fsyntax-only blocks/rend.cpp blocks/ui.cpp blocks/gui.cpp
```
