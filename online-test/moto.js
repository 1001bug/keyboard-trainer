"use strict";

//import qna_readonly from './qna_en_compact.json' with { type: 'json'};


let isError = false;
let errorCount = 0;
let correctCnt = 0;
let skippedCnt = 0;
let QnA;

//const QnA = shuffleArray(qna_readonly).map(({ answers, ...theRest }) => ({




const exerciseList = document.querySelector(".exercise-list-container");
const questionsList = exerciseList.querySelector(".exercises")
let cnt = 1;


exerciseList.addEventListener("click", function (event) {
    event.currentTarget.querySelectorAll('.active').forEach(function (el) { el.classList.remove('active'); });


    //const exerciseList=document.querySelector('.exercise-list')




    const target = event.target;
    const item = target.closest("[data-ref]")
    const ref = item.dataset.ref;
    const state = item.dataset.state; // 'pending', 'correct', 'wrong'

    //exerciseList.dataset.state = `${state}`;
    //exerciseList.dataset.ref = `${ref}`;


    console.log(ref);
    if(!ref || ref === '' || ref === 'none') return;


    item.classList.add("active");


    const q = QnA.find( q => q.ref == ref)



    const answersHtml = exerciseHtml(q.answers, q.answerIDX)
    fillExerciseList(q, answersHtml)

    //TODO when drow answers list - highlight correct answer if state CORRECT
    //TODO when drow answers list - lock it if state NOT pending




})


function frcList(){
    const tmp = frc.map(v => {
        return {numerator: v[0], denominator: v[1], label: `${v[0]}/${v[1]}`, value: v[0] / v[1] }}
    );
    const tmpSorted = tmp.sort((a, b) => a.value - b.value);
    console.log('tmpSorted', tmpSorted);

    return tmpSorted;
}

function completionMessage(show) {
    const completionMessage = document.querySelector(".completion-message");
    if (typeof show === 'undefined' ) {
        return completionMessage.classList.contains('show')
    } else if(show) {
        completionMessage.classList.add('show');
    } else {
        completionMessage.classList.remove('show');
    }
}

function scrollToBottom() {
    const list = document.querySelector('.exercises');
    list.scrollTop = list.scrollHeight;
}


//will return sorted
function getInterval(arr, intervalSize) {
    if (arr.length <= intervalSize) return arr; // Меньше или равно интервалу — возвращаем всё

    const maxStart = arr.length - intervalSize;

    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    const start = random[0] % (maxStart + 1);

    return arr.slice(start, start + intervalSize);
}

//will return shuffled - need SORT after it
function getRand(arr, listSize) {
    if (arr.length <= listSize) return arr; // Меньше или равно интервалу — возвращаем всё


    const shuffled = shuffleArray(arr)
    const cut = shuffled.slice(0, listSize);


    return cut;
}


function shuffleArray(arrayOrig) {
    const array = [...arrayOrig];
    const randoms = new Uint32Array(array.length);
    crypto.getRandomValues(randoms);
    for (let i = array.length - 1; i > 0; i--) {
        const j = randoms[i] % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Prevent space from scrolling
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
    }
});






function exerciseHtml(list, answerIDX) {
    let exercises = [];
    for (let i = 0; i < list.length; i++) {
        const t = document.createElement('div');
        t.classList = 'answer-item';
        t.dataset.correct = list[i].correct; //&bull;
        t.dataset.idx = i;
        if(answerIDX == i){
        t.classList.add( list[i].correct ? 'good' : 'bad')
        }
        t.innerHTML = `<div class="label">${list[i].text}</div><div class="icn"></div>`;
        exercises.push(t);
    }
    return exercises;
}

function fillExerciseList(question, htmlElements) {

    // STATE 'pending', 'correct', 'wrong'
    //TODO make adjastments to view acording to state

    const elst = document.querySelector('.answer-list')
    const edata = document.querySelector('.exercise-data')
    elst.innerHTML = '';
    edata.innerHTML = '';

    elst.replaceChildren(...htmlElements);
    elst.dataset.ref = question.ref;
    elst.dataset.answerIDX = question.answerIDX;
    elst.dataset.state = question.state;

    if(question.image && question.alt) {

        const img = document.createElement('img');
        img.src = 'moto/' + question.image.replace("jpeg", "webp");
        edata.appendChild(img);
        const alt = document.createElement('div');
        alt.innerText = question.alt;
        edata.appendChild(alt);

        //edata.innerHTML = `<div>asdasdasd</div>`; //<iimg src="${question.image}>
    }
    document.querySelector('.exercise-label').innerHTML = question.question;
}

function init(){
    let exercises_path = '';
    switch(window.location.search) {
        case '?ru':
            exercises_path = './qna_ru_compact.json';
            break;
        case '?es':
            exercises_path = './qna_es_compact.json';
            break;
        default:
            exercises_path = './qna_en_compact.json';
    }

    //const exercises_en_path = './qna_en_compact.json';
    //const exercises_ru_path = './qna_ru_compact.json';

    fetch(exercises_path)
        .then(res => res.json())
        .then(out => {
            //console.log('Loaded JSON ', out)
            prepare_data(out)
        })
        .catch(err => console.log(err));
}

function prepare_data(qna){
    QnA = shuffleArray(qna).map(({ answers, ...theRest }) => ({
    ...theRest,
    answerIDX: -1,
    state: 'pending', //   'pending', 'correct', 'wrong'
    answers: shuffleArray(answers)
    }));


    //console.log(qna_readonly);
    //console.log(QnA);

    QnA.forEach( q => {
    const t = document.createElement('div');
    //TODO: REMOVE REF from test title in PROD
    t.innerHTML = `<span>${cnt++}.</span><span>${q.question}</span>`
    t.classList = 'exercise-item';
    t.dataset.ref = `${q.ref}`;
    t.dataset.answer = `${q.answerIDX}`;
    t.dataset.state = q.state //   'pending', 'correct', 'wrong'



    questionsList.appendChild(t);
    })

    preloadImages(QnA);
}

function preloadImages(questions) {
  for (const q of questions) {
    if (!q.image) continue;
    const img = new Image();
    img.src = 'moto/' + q.image.replace(/\.jpe?g$/, '.webp');
    img.decode().catch(() => {});
  }
}

function nextQuestion(){
    const exerciseList = document.querySelector('.exercise-list-container');
    const active = exerciseList.querySelector('.exercise-item.active');

    if (active) {
    const nextElement = active.nextElementSibling;

    if (nextElement) {
        nextElement.click();
        nextElement.scrollIntoView({block: "center", inline: "nearest"})
    } else {
        const firstElement = exerciseList.querySelector('.exercise-item');
        if (firstElement) {
            firstElement.click();
            firstElement.scrollIntoView({block: "center", inline: "nearest"})
        }
    }
    } else {
    console.warn('Элемент с классом "active" не найден');
    }
}
function showDialog(question, idx) {

        const dialog = document.createElement('dialog');
        const isCorrect = question.answers[idx].correct;

        const ref = question.answers.findIndex( a => a.correct == true)
        dialog.classList = isCorrect ? 'correct' : 'wrong';
        //color: ${isCorrect ? 'darkgreen' : 'red'};
        dialog.innerHTML = `
        <h2 style="align-self: center; ">${isCorrect ? 'Correct!' : 'Wrong!'}</h1>
        <h3>Question</h2>
        <h4>${question.question}</h3>
        <br>
        <h3>Correct answer</h2>
        <h4>${question.answers[ref].text}</h3>
        <br>
        <h3>Why</h2>
        <p>${question.reasoning}</p>
        <br>
        <form method="dialog">
            <button>${isCorrect ? 'Next' : 'Retry'}</button>
        </form>`;
        document.body.appendChild(dialog);

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
            }
        });
        dialog.addEventListener('close', () => {
            dialog.remove();
            if(isCorrect) nextQuestion()

        });
        dialog.showModal();
    }



// Initialize
document.querySelector('.answer-list').addEventListener('click', (e) => {

    const item = e.target.closest('.answer-item');
    if(!item)return;

    console.log('clicked', item.textContent, item.dataset.correct);

    item.parentElement.querySelectorAll('.answer-item').forEach(e => e.classList.remove('pointed'))
    item.classList.add('pointed')

    const exercise = item.closest('[data-ref]');

    const ref = exercise.dataset.ref;
    const state = exercise.dataset.state;
    const answerIDX = item.dataset.idx;
    const question = QnA.find( q => q.ref == ref)
    const correct = question.answers[answerIDX].correct


    if(question.answerIDX < 0) {
        if(correct){
            correctCnt++;
            document.querySelector(".stat-value.correct-cnt").innerText = `${correctCnt}`
        }
        question.answerIDX = answerIDX;
        const t = document.querySelector(`.exercise-item[data-ref="${ref}"]`);
        if(t){
            t.classList.add(correct ? 'good' : 'bad')
        }

    }
    // get correct/wrong
    // counter in HEADER
    // mark current SELECTED item with green/red border (correct/wrong)
    // mark .exercise-item inside .exercise-list acording to correct/wrong
    // create HTML with "WRONG"/"CORRECT!", Question, Answer, Reasoning

    // on dialog close - go to next question if any


    showDialog(question, answerIDX)


})

console.log(`
%c
888    888 8888888888 888      888      .d88888b.       888       888  .d88888b.  8888888b.  888      8888888b.
888    888 888        888      888     d88P" "Y88b      888   o   888 d88P" "Y88b 888   Y88b 888      888  "Y88b
888    888 888        888      888     888     888      888  d8b  888 888     888 888    888 888      888    888
8888888888 8888888    888      888     888     888      888 d888b 888 888     888 888   d88P 888      888    888
888    888 888        888      888     888     888      888d88888b888 888     888 8888888P"  888      888    888
888    888 888        888      888     888     888      88888P Y88888 888     888 888 T88b   888      888    888
888    888 888        888      888     Y88b. .d88P      8888P   Y8888 Y88b. .d88P 888  T88b  888      888  .d88P
888    888 8888888888 88888888 88888888 "Y88888P"       888P     Y888  "Y88888P"  888   T88b 88888888 8888888P"
`, "color: #3b82f6; font-weight: bold;");

console.log(
    "%c 🚀 DIY Project %c System ready. Welcome to the backstage.",
    "background: #f59e0b; color: #3b82f6; padding: 5px 10px; border-radius: 4px 0 0 4px; font-weight: bold;",
    "background: #ef4444; color: white; padding: 5px 10px; border-radius: 0 4px 4px 0;"
);

init()
