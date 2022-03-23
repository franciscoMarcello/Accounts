const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Sacar") {
        withDraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlueBright.black("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  console.log(chalk.bgGreen.black("Parabens por escolher o nosso banco"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
}
function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome para sua conta",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabéns sua conta foi criada"));
      operation();
    })
    .catch((err) => console.log(err));
}
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!checkAccount(accountName)) {
        return deposit();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Esta conta não existe, escolha outro nome!")
    );
    return false;
  }
  return true;
}
function addAmount(accountName, amount) {
  const account = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro tente novamente mais tarde")
    );
  }
  account.balance = parseFloat(amount) + parseFloat(account.balance);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(account),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }
      const accountData = getAccount(accountName);
      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta e de ${accountData.balance}`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}
function withDraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withDraw();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "quanto voce deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}
function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro!"));
    return withDraw();
  }
  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Saldo insuficente"));
    return withDraw();
  }
  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  console.log(chalk.green(`Foi feito um saque no valor de R$${amount}`));
  operation();
}
