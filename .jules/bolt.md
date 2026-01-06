## 2024-05-24 - [Regex Recompilation in Hot Path]
**Learning:** Defining `RegExp` objects inside frequently called functions (like middleware or request validation helpers) forces the engine to create a new object every time.
**Action:** Move static regex definitions to module scope (outside the function) so they are created once and reused.
