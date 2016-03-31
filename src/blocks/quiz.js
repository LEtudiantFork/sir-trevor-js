'use strict';

const _     = require('../lodash');
const Dom   = require('../packages/dom');
const Block = require('../block');

const template = ``;

module.exports = Block.extend({

    type: 'quiz',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:quiz:title'); },

    icon_name: 'quiz',

    loadData(data){
        let renderedContent = _.template(template)(data);

        let quizElem = Dom.createElement('div', {
            'class': 'st-block--quiz'
        });

        quizElem.innerHTML = renderedContent;

        this.inner.appendChild(quizElem);
    },

    onBlockRender() {}
});

/*
{
  "id": "1174",
  "title": "Grand Quiz \"Un jour, une question\" letudiant.fr/franceinfo.fr - Question 48",
  "description": "<p style=\"text-align: justify;\"><strong>Voici la 48e et dernière question du Quiz</strong><br><br> Vous avez jusqu'au lendemain matin pour y répondre. Un tirage au sort désignera le gagnant parmi les candidats ayant donné la bonne réponse. Celui-ci recevra le livre <em>\"2500 QCM de culture générale\"</em>, édition L’Etudiant (2014).<br><br> Un second tirage au sort parmi ceux qui auront répondu correctement à au moins 10 questions, récompensera trois d'entre eux avec d'autres lots.</p>",
  "thumbnail": "http://www.letudiant.lh/uploads/jcs_formulaire_quizz/thumbnails/grand-quiz-un-jour-une-question-letudiant-fr-franceinfo-fr-question-48-1174.jpg",
  "image": "http://www.letudiant.lh/uploads/jcs_formulaire_quizz/image/grand-quiz-un-jour-une-question-letudiant-fr-franceinfo-fr-question-48-1174.jpg",
  "url": "http://ww2.letudiant.lh/quizz/france-info/grand-quiz-un-jour-une-question-letudiant-fr-franceinfo-fr-question-48.html",
  "application": "ETU_ETU",
  "site": "L'Etudiant",
  "bo_link": "http://http://bo.letudiant.lh/boJcsFormulaireQuizz/editer/id/1174"
}
*/
