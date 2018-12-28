
:speak_no_evil: This is in alpha state

[![Build status](https://dev.azure.com/josefmp/Webassembly/_apis/build/status/wasm-diassembler-CI)](https://dev.azure.com/josefmp/Webassembly/_build/latest?definitionId=13)

[![Alpha stage](https://vsrm.dev.azure.com/JoseFMP/_apis/public/Release/badge/0f6d5d48-0b71-416d-b53d-4c21c2a8a9b5/1/1)](https://vsrm.dev.azure.com/JoseFMP/_apis/public/Release/badge/0f6d5d48-0b71-416d-b53d-4c21c2a8a9b5/1/1)


# Quick information
This is an NPM library that is capable to disassembly webassemblies binaries.
It is based on typescript and is targeting to be high-performance and minimalistic
in the amount of dependencies.

To install it just issue:
```
npm install wasm-disassembler
```

To disassemble a WASM binary:
```typescript

import { WasmMemoryProvider, WasmDisassembler } from 'wasm-disassembler';

const binaryProvider = new WasmMemoryProvider(binary);
const disassembler = new WasmDisassembler(binaryProvider);
const disassembly = await disassembler.Disassemble();
```
where `binary` is a `Uint8Array` type.
Note that you can implement your own binary provider besides the already existing `WasmMemoryProvider`. For that purpose you just need to implement the `WasmBinaryProvider` interface.
# Feedback
Did you find any bugs? Do you want a specific feature to be implemented for your organization? Drop me a line.