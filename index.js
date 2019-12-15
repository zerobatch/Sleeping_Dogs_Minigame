const startGameform = document.getElementById("options");

startGameform.addEventListener("submit", function(event) {
  event.preventDefault();

  const difficulty = this.querySelector("select#difficulty").value;

  const gameInstance = new GameCore(difficulty);
});

class GameCore {
  availableOptions = {
    easy: {
      items: 4,
      tries: 6
    },
    normal: {
      items: 7,
      tries: 8
    },
    hard: {
      items: 9,
      tries: 10
    }
  };

  availableNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  gameHistory = [];

  constructor(difficulty, gameUtils = GameUtils, gameContainer = null) {
    this.difficulty = this.availableOptions[difficulty];
    this.GameUtils = gameUtils;

    this.gameNumbers = this.generateNumbersBasedOnDifficulty(
      this.availableNumbers,
      this.difficulty["items"]
    );

    this.mainContainer = document.createElement("main");
    this.mainContainer.classList.add("main-game-container");

    this.gameHistoryContainer = document.createElement("section");
    this.gameHistoryContainer.setAttribute("id", "game-history");

    this.gameContainer = gameContainer;

    if (!this.gameContainer || !(this.gameContainer instanceof HTMLElement)) {
      this.gameContainer = document.createElement("section");
      this.gameContainer.setAttribute("id", "game");
    }

    this.inputNumberContainer = this.createNumberContainer();
    this.gameContainer.appendChild(this.inputNumberContainer);

    this.mainContainer.appendChild(this.gameHistoryContainer);
    this.mainContainer.appendChild(this.gameContainer);

    document.body.appendChild(this.mainContainer);
  }

  createNumberContainer() {
    const container = document.createElement("div");

    container.classList.add("number-container");

    for (let number = 0; number < this.difficulty["items"]; number++) {
      const wrapper = this.createNumberWrapper(number);

      container.appendChild(wrapper);
    }

    const enterInputNumbers = document.createElement("button");
    enterInputNumbers.classList.add("enter-input");
    enterInputNumbers.innerHTML = "&times";

    enterInputNumbers.addEventListener("pointerdown", event => {
      const userInputResult = this.formatUserInputAsObject();
      const userInputResultValuesAsArray = Object.values(
        userInputResult
      ).map(number => parseInt(number));

      if (
        this.GameUtils.haveDuplicateElementsOnArray(
          userInputResultValuesAsArray
        )
      ) {
        console.log("SE DUPLICAN NUMEROS");
      } else {
        this.compareUserInputWithGameNumbers(userInputResult);
        this.updateGameHistory();
      }
    });

    container.appendChild(enterInputNumbers);
    return container;
  }

  updateGameHistory() {
    console.log(this.gameNumbers);
    this.GameUtils.emptyDomElement(this.gameHistoryContainer);

    this.gameHistory.forEach(history => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("history-container");

      Object.keys(history).forEach(position => {
        let stateClass = "";
        const historyData = history[position];

        if (!historyData.player_position) {
          stateClass = "failed";
        } else if (historyData.player_position === "exists") {
          stateClass = "bad-position";
        } else {
          stateClass = "good-position";
        }

        const numberContainer = document.createElement("div");
        numberContainer.classList.add("number-container", stateClass);
        numberContainer.innerText = historyData.number;

        wrapper.appendChild(numberContainer);
      });

      this.gameHistoryContainer.appendChild(wrapper);
    });
  }

  createNumberWrapper(position) {
    const wrapper = document.createElement("div");

    wrapper.classList.add("number-wrapper");
    wrapper.setAttribute("data-position", position);

    for (let number = 0; number < 10; number++) {
      const numberElement = document.createElement("div");
      numberElement.setAttribute("class", `#${position}-${number}`);
      numberElement.innerText = number;

      wrapper.appendChild(numberElement);
    }

    return wrapper;
  }

  compareUserInputWithGameNumbers(userInput) {
    let gameHistoryObject = {};

    Object.keys(userInput).forEach(position => {
      const userInputNumber = userInput[position];

      gameHistoryObject[position] = { ...this.gameNumbers[position] };
      gameHistoryObject[position]["number"] = userInputNumber;
      gameHistoryObject[position]["checked"] = true;

      if (userInputNumber === this.gameNumbers[position]["number"]) {
        gameHistoryObject[position]["player_position"] = position;
      } else {
        const numberExistInAnotherPositionResult = this.numberExistsOnGameNumbers(
          userInputNumber
        );
        gameHistoryObject[position][
          "player_position"
        ] = numberExistInAnotherPositionResult ? "exists" : null;
      }
    });

    this.gameHistory.push(gameHistoryObject);

    return gameHistoryObject;
  }

  numberExistsOnGameNumbers(number) {
    let result = false;

    Object.keys(this.gameNumbers).forEach(position => {
      if (number === this.gameNumbers[position]["number"]) {
        result = true;
      }
    });

    return result;
  }

  formatUserInputAsObject() {
    const wrappers = this.inputNumberContainer.querySelectorAll(
      ".number-wrapper"
    );
    const result = {};

    Array.from(wrappers).forEach(wrapper => {
      const position = wrapper.getAttribute("data-position");
      let visibleNumber = 0;

      Array.from(wrapper.children).forEach(number => {
        const bounding = number.getBoundingClientRect();
        if (bounding.top > 187 && bounding.top < 216) {
          visibleNumber = number.innerText;
        }
      });

      result[position] = parseInt(visibleNumber);
    });

    return result;
  }

  generateNumbersBasedOnDifficulty(availableNumbers, items = 4) {
    let random = {};

    for (let index = 0; index < items; index++) {
      const randomNumber = this.GameUtils.randomElementFromArray(
        availableNumbers
      );

      availableNumbers = availableNumbers.filter(number => {
        return number !== randomNumber;
      });

      random[index] = {
        number: randomNumber,
        checked: false,
        player_position: null
      };
    }

    return random;
  }
}

class GameUtils {
  static randomElementFromArray(array, num = 1) {
    num = +num;

    if (isNaN(num) || num > array.length) {
      return null;
    }

    const length = array.length;

    for (let i = length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));

      let tmp = array[j];

      array[j] = array[i];
      array[i] = tmp;
    }

    const randomElement = num === 1 ? array[0] : array.slice(0, num);

    return parseInt(randomElement);
  }

  static haveDuplicateElementsOnArray(numbers) {
    const originalLength = numbers.length;

    let unique = Array.from(new Set(numbers));

    return unique.length !== originalLength;
  }
  static emptyDomElement(element) {
    const myNode = element;
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
  }
}
