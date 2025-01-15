import {templates,select} from '../settings.js';

class Home {
    constructor(element){
        const thisHome=this;
        thisHome.element=element;

        console.log(thisHome.element)

        thisHome.render();
        thisHome.initWidgets();
    }



    render(){
        const thisHome=this;

        const generateHTML=templates.homePage();

        thisHome.dom={};

        thisHome.dom.wrapper=thisHome.element;

        thisHome.dom.wrapper.innerHTML=generateHTML;

        thisHome.dom.carousel=thisHome.dom.wrapper.querySelector(select.home.carousel);
    }

    initWidgets(){
        const thisHome=this;

        thisHome.carousel= new Flickity (thisHome.dom.carousel,{
            cellAlign: 'left',   // Wyrównanie elementów do lewej
            contain: true,       // Zawijanie elementów w obrębie kontenera
            autoplay: true,      // Automatyczne przesuwanie
            prevNextButtons: true, // Dodanie przycisków "poprzedni" i "następny"
            pageDots: true       // Dodanie kropek nawigacyjnych
        });



    }

}

export default Home