import {templates,select} from '../settings.js';

class Home {
    constructor(element){
        const thisHome=this;
        thisHome.element=element;

        //console.log(thisHome.element)

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
            contain: true,
            pageDots: true,
            wrapAround: true,
            autoPlay: true,
            prevNextButtons: false,
        });

    }

}

export default Home