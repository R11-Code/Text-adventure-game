// Mendapatkan elemen-elemen HTML yang diperlukan
const output = document.querySelector(".output");
const choices = document.querySelector(".choices");
const content = document.querySelector(".content");
const playBtn = document.querySelector(".btn");
const box = document.querySelector(".box");
const h1 = document.querySelector(".title");

// Indeks dialog saat ini
let currentDialogIndex = 0;

// Fungsi untuk mengambil data dari JSON
async function fetchData() {
  const jsonURL = ".//./api.json";
  try {
    const response = await fetch(jsonURL);

    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("Error: " + response.status);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// Fungsi untuk menampilkan teks dengan efek ketik
function typeText(text, index, element, callback) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    index++;
    setTimeout(() => typeText(text, index, element, callback), 70);
  } else {
    callback();
  }
}

// Fungsi untuk menghapus output sebelumnya
function clearOutput() {
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
}

// Fungsi untuk mencetak teks dengan jeda
function printWithDelay(text, callback) {
  clearOutput();

  const paragraph = document.createElement("p");
  output.appendChild(paragraph);

  setTimeout(() => {
    typeText(text, 0, paragraph, callback);
  }, 1000);
}

// Fungsi untuk menampilkan cerita berdasarkan pilihan
function displayStory(start) {
  choices.style.visibility = 'hidden';
  printWithDelay(start.text, () => {
    choices.style.visibility = 'visible';
    choices.innerHTML = "";

    start.choices.forEach(choice => {
      const button = document.createElement("button");
      button.textContent = choice.choices_text;
      button.addEventListener("click", () => handleChoice(start, choice));
      choices.appendChild(button);
    });
  });
}

// Fungsi untuk menangani pilihan pengguna
async function handleChoice(currentStory, choice) {
  try {
    const data = await fetchData();
    const nextStory = data.story.find(story => story.id === choice.move_to);
    
    currentDialogIndex = data.story.indexOf(nextStory);
    h1.textContent = nextStory.id.replace(/_/g, ' ');
    displayStory(nextStory);

    // Simpan pilihan ke localStorage
    const savedChoices = JSON.parse(localStorage.getItem('savedChoices')) || [];
    savedChoices.push(choice);
    localStorage.setItem('savedChoices', JSON.stringify(savedChoices));
  } catch (error) {
    console.error("Error in handleChoice:", error);
  }
}

// Fungsi untuk memulai permainan
async function startGame() {
  try {
    const data = await fetchData();
    const startStory = data.story.find(story => story.id === "Mulai");
    displayStory(startStory);

    // Memuat pilihan dari localStorage
    const savedChoices = JSON.parse(localStorage.getItem('savedChoices')) || [];
    savedChoices.forEach(savedChoice => {
      const matchingChoice = startStory.choices.find(choice => choice.choices_text === savedChoice.choices_text);
      if (matchingChoice) {
        handleChoice(startStory, matchingChoice);
      }
    });
  } catch (error) {
    console.error("Error in startGame:", error);
  }
}

// Menampilkan elemen awal permainan
box.style.display = "inline-block";
content.style.display = "none";

// Menambahkan event listener untuk tombol "Mainkan"
playBtn.addEventListener("click", () => {
  setTimeout(() => {
    box.style.display = "none";
    content.style.display = "block";
    
    startGame();
  }, 3001);
});
