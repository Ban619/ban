## Error handlers

The handler syntax uses colons to open each section and semicolons to close it:

```text
try:
    <risky command>
    catch:
        <recovery command>
        finally:
            <cleanup command>
        ;
    ;
;
```

```text
try<dawbi>:
    ambot
;
```

The equivalent single-line form is:

```text
try: ambot ; catch: bangon ; finally: limpyo ;
```

The parameterized single-line form is:

```text
try<dawbi>: ambot ;
```