# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 2)

## 3. Improving the microservices solution

### 3.1. Adding `husky` to the solution

- We are going to add [husky](https://typicode.github.io/husky/) to the solution to run the `lint` and `format` commands when we commit the code.

- We are going to use the following commands:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save-dev husky lint-staged --force
npm WARN using --force Recommended protections disabled.
npm WARN ERESOLVE overriding peer dependency
.
added 51 packages, removed 1 package, and audited 1255 packages in 7s

219 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- we need to execute `husky` using `npx husky init` to initialize the husky configuration.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npx husky init
```

It will create a `.husky` folder with the following file:

> .husky/pre-commit

```text
npm test
```

- We are going to change the `pre-commit` file to run the `lint-staged` command.

> .husky/pre-commit

```text
npx lint-staged --relative
```

- We need to create the `.lintstagedrc` file to configure the `lint-staged` configuration.

> .lintstagedrc

```json
{
  "*.ts": ["nx affected:lint --fix --files"],
  "*": ["nx format:write --files"]
}
```

- We can test if it works by creating a new commit and see if the `lint-staged` command is executed.
