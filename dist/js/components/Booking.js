import {select,templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element){
        const thisBooking=this;

        thisBooking.element=element;

        thisBooking.render();
        thisBooking.initWidget();
    }

    render(){
        const thisBooking=this;

        const generateHTML=templates.bookingWidget();

        thisBooking.dom={};

        thisBooking.dom.wrapper=thisBooking.element;

        thisBooking.dom.wrapper.innerHTML=generateHTML;

        thisBooking.dom.peopleAmount=thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

        thisBooking.dom.hoursAmount=thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker=thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        //console.log(thisBooking.dom.datePicker);

        thisBooking.dom.hourPicker=thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        //console.log(thisBooking.dom.hourPicker);
    }

    initWidget(){
        const thisBooking=this;

        thisBooking.peopleAmount= new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.hoursAmount=new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('click', function(){});

        thisBooking.dom.hoursAmount.addEventListener('click', function(){});

        thisBooking.datePicker=new DatePicker(thisBooking.dom.datePicker);

        thisBooking.hourPicker=new HourPicker(thisBooking.dom.hourPicker);
    }
}
export default Booking;