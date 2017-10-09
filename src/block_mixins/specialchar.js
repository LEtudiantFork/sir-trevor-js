'use strict';

var utils = require('../utils');

module.exports = {

    mixinName: "Specialchar",

    selectedNode: {},

    listchar: [
        "&cent;", "¢", "&euro;", "€", "&pound;", "£", "&yen;", "¥", "&copy;", "©", "&reg;", "®", "&trade;", "™", "&permil;", "‰", "&micro;", "µ", "&middot;", "·", "&bull;", "•", "&hellip;", "…", "&sect;", "§", "&para;", "¶", "&szlig;", "ß", "&lsaquo;", "‹", "&rsaquo;", "›", "&laquo;", "«", "&raquo;", "»", "&bdquo;", "„", "&le;", "≤", "&ge;", "≥", "&mdash;", "—", "&macr;", "¯", "&oline;", "‾", "&curren;", "¤", "&brvbar;", "¦", "&uml;", "¨", "&iexcl;", "¡", "&iquest;", "¿", "&deg;", "°", "&plusmn;", "±", "&divide;", "÷", "&times;", "×", "&sup1;", "¹", "&sup2;", "²", "&sup3;", "³", "&frac14;", "¼", "&frac12;", "½", "&frac34;", "¾", "&not;", "¬", "&cedil;", "¸", "&aacute;", "á", "&Aacute;", "Á", "&Acirc;", "Â", "&Agrave;", "À", "&aring;", "å", "&Aring;", "Å", "&atilde;", "ã", "&Atilde;", "Ã", "&Auml;", "Ä", "&aelig;", "æ", "&AElig;", "Æ", "&Ccedil;", "Ç", "&Eacute;", "É", "&Ecirc;", "Ê", "&Egrave;", "È", "&Euml;", "Ë", "&iacute;", "í", "&Iacute;", "Í", "&Icirc;", "Î", "&igrave;", "ì", "&Igrave;", "Ì", "&Iuml;", "Ï", "&ntilde;", "ñ", "&Ntilde;", "Ñ", "&oacute;", "ó", "&Oacute;", "Ó", "&Ocirc;", "Ô", "&ograve;", "ò", "&Ograve;", "Ò", "&oslash;", "ø", "&Oslash;", "Ø", "&otilde;", "õ", "&Otilde;", "Õ", "&Ouml;", "Ö", "&oelig;", "œ", "&OElig;", "Œ", "&scaron;", "š", "&Scaron;", "Š", "&szlig;", "ß", "&eth;", "ð", "&ETH;", "Ð", "&thorn;", "þ", "&THORN;", "Þ", "&uacute;", "ú", "&Uacute;", "Ú", "&Ucirc;", "Û", "&ugrave;", "ù", "&Ugrave;", "Ù", "&Uuml;", "Ü", "&yacute;", "ý", "&Yacute;", "Ý", "&Yuml;", "Ÿ", "&alpha;", "α", "&Alpha;", "Α", "&beta;", "β", "&Beta;", "Β", "&gamma;", "γ", "&Gamma;", "Γ", "&delta;", "δ", "&Delta;", "Δ", "&epsilon;", "ε", "&Epsilon;", "Ε", "&zeta;", "ζ", "&Zeta;", "Ζ", "&eta;", "η", "&Eta;", "Η", "&theta;", "θ", "&Theta;", "Θ", "&iota;", "ι", "&Iota;", "Ι", "&kappa;", "κ", "&Kappa;", "Κ", "&lambda;", "λ", "&Lambda;", "Λ", "&mu;", "μ", "&Mu;", "Μ", "&nu;", "ν", "&Nu;", "Ν", "&xi;", "ξ", "&Xi;", "Ξ", "&omicron;", "ο", "&Omicron;", "Ο", "&pi;", "π", "&Pi;", "Π", "&rho;", "ρ", "&Rho;", "Ρ", "&sigma;", "σ", "&sigmaf;", "ς", "&Sigma;", "Σ", "&tau;", "τ", "&Tau;", "Τ", "&upsilon;", "υ", "&Upsilon;", "Υ", "&phi;", "φ", "&Phi;", "Φ", "&chi;", "χ", "&Chi;", "Χ", "&psi;", "ψ", "&Psi;", "Ψ", "&omega;", "ω", "&Omega;", "Ω", "&loz;", "◊", "&spades;", "♠", "&clubs;", "♣", "&hearts;", "♥", "&diams;", "♦", "&larr;", "←", "&uarr;", "↑", "&rarr;", "→", "&darr;", "↓", "&harr;", "↔"
    ],

    createPopinSpecialChar: function() {
        // On ne créer la popin qu'une seule fois !
        if (!document.querySelector('.st-popin-specialchar')) {

            // HTML popin
            let htmlListChar = ``;
            for (let i = 0, lgth = this.listchar.length; i < lgth; i = i+2) {
                htmlListChar += `<a class="st-specialchar-item" data-htmlcode="${this.listchar[i]}" href="javascript:;">${this.listchar[i+1]}</a>`
            }

            let htmlPopinSpecialChar = `
                <div class="st-popin-specialchar">
                    <h3 class="st-popin-handler">Choisir le caractère à insérer</h3>
                    <div class="st-list-specialchar">
                        ${htmlListChar}
                    </div>
                    <span class="st-popin-close">
                        <svg role="img" class="st-icon">
                            <use xlink:href="#icon-thick-cross" />
                        </svg>
                    </span>
                </div>`;

            // insert la popin à la fin du body
            document.querySelector('body').insertAdjacentHTML('beforeend', htmlPopinSpecialChar);

            // rend la popin draggable
            this.setPopinDraggable();

            // croix de fermeture
            document.querySelector('.st-popin-specialchar .st-popin-close').addEventListener('click', this.closePopinSpecialChar.bind(this));

            // insertion d'un caractère speciale
            let $specialcharBtn = document.querySelectorAll('.st-specialchar-item');
            for (let i = 0, lgth = $specialcharBtn.length; i < lgth; i++) {

                $specialcharBtn[i].addEventListener('click', (e) => {
                    let htmlcode = e.currentTarget.dataset.htmlcode;
                    let $popin = document.querySelector('.st-popin-specialchar');
                    let $contentEditable = document.getElementById($popin.dataset.blockID).querySelector('[contenteditable]')

                    $contentEditable.focus();

                    var scribe = this._scribe;

                    var selection = new scribe.api.Selection();
                    var range = selection.range.cloneRange();
                    range.setStart(this.selectedNode[$popin.dataset.blockID] || $contentEditable.childNodes[0], $contentEditable.dataset.cursorPos || 0);
                    range.collapse(true);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);

                    scribe.insertHTML(htmlcode);

                    this.closePopinSpecialChar();
                });
            }
        }
    },

    openPopinSpecialChar: function(blockID) {
        let $popin = document.querySelector('.st-popin-specialchar');
        $popin.dataset.blockID = blockID;

        $popin.style.top = '50%';
        $popin.style.left = '50%';
        $popin.classList.add('is-visible');
    },

    closePopinSpecialChar: function() {
        let $popin = document.querySelector('.st-popin-specialchar');

        $popin.classList.remove('is-visible');
    },

    setPopinDraggable: function() {
        let $popin = document.querySelector('.st-popin-specialchar');

        const onMouseDown = function() {
            window.addEventListener('mousemove', onMouseMove, true);
        }
        const onMouseUp = function() {
            window.removeEventListener('mousemove', onMouseMove, true);
        }
        const onMouseMove = function(e) {
            //TODO ? correction par rapport au curseur ! Peut être récupérer xy au mousedown puis faire un delta ?

            let x = Math.min(Math.max(0, e.clientX), document.body.clientWidth - $popin.clientWidth);
            let y = Math.min(Math.max(0, e.clientY), document.body.clientHeight - $popin.clientHeight);

            $popin.style.top = y + 'px';
            $popin.style.left = x + 'px';
        }

        document.querySelector('.st-popin-handler').addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mouseup', onMouseUp);
    },

    initializeSpecialchar: function() {
        utils.log("Adding special char to block " + this.blockID);

        // On créer la popin de selection d'un caractère spéciale
        this.createPopinSpecialChar();

        // On créer le bouton pour ouvrir la popin et on l'insère dans le DOM
        var span = document.createElement('span');
        span.className = "st-specialchar";

        this.el.insertBefore(span, this.inner);

        // Au clic sur le bouton, on ouvre la popin
        span.addEventListener('click', (e) => {
            this.openPopinSpecialChar(this.blockID);
        });

        setTimeout(() => {
            if (this.el.querySelector('[contenteditable]')) {
                // On sauvegarde la position du curseur quand on sort d'un champ
                this.el.querySelector('[contenteditable]').addEventListener('blur', (e) => {
                    e.currentTarget.dataset.cursorPos = window.getSelection().getRangeAt(0).startOffset;
                    this.selectedNode[this.blockID] = window.getSelection().anchorNode; // On ne peut pas enregistrer un object dans les dataset :(
                });
            }

            // On ajoute l'icône du bouton (on doit attendre qu'il soit bien inséré dans le DOM)
            span.innerHTML = '<svg role="img" class="st-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-mathematiques"></use></svg>';
        },0);
    }
};
