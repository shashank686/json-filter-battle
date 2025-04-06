# JSON Filter Battle: Bun vs Node

A quick benchmarking project to compare **Bun** and **Node.js** performance for filtering large JSON files via CLI. This project showcases how Bun’s speed and efficiency stacks up against traditional Node.js for typical file I/O and processing tasks.


# Response

When you run the CLI tool on a sample dataset, here's what the console output looks like:

```
Parsed 10 records
Filter: item.active === true
Matched 5 out of 5 items (50.00%)
Output written to active.json (some bytes)
Filtering completed in 1.23 ms
```