import {settings,select,classNames,templates} from '../settings.js'
import utils from '../utils.js'
import CartProduct from '../components/CartProduct.js'

class Cart {
    constructor(element){
      const thisCart=this;

      thisCart.products=[];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart:', thisCart);
    }

    getElements (element) {
      const thisCart =this;

      thisCart.dom={};

      thisCart.dom.wrapper=element;

      thisCart.dom.toggleTrigger=thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList=thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.dom.deliveryFee=thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
     // console.log(thisCart.dom.deliveryFee);

      thisCart.dom.subtotalPrice=thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      //console.log(select.cart.subtotalPrice);

      thisCart.dom.totalPrice=thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      //console.log(thisCart.dom.totalPrice);

      thisCart.dom.form=thisCart.dom.wrapper.querySelector(select.cart.form);
      //console.log(thisCart.dom.form);

      thisCart.dom.totalNumber=thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      //console.log(thisCart.dom.totalNumber);

      thisCart.dom.deliveryFee=thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

      thisCart.dom.subtotalPrice=thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      //console.log(thisCart.dom.subtotalPrice);

      thisCart.dom.address=thisCart.dom.wrapper.querySelector(select.cart.address);

      //console.log(thisCart.dom.address);

      thisCart.dom.phone=thisCart.dom.wrapper.querySelector(select.cart.phone);

    }

    initActions(){
      const thisCart=this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        //add active class
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated',function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove',function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit',function(event){
        event.preventDefault();
        thisCart.sendOrder();
      })
    }

    add(menuProduct){
      const thisCart=this;



      //console.log('adding product:', menuProduct);

      /* generate HTML based on template */
      const generateHTML =templates.cartProduct(menuProduct);

      /* create element using utils.createElementFromHTML */

      const generateDOM = utils.createDOMFromHTML(generateHTML);

      /* add element to menu */

      thisCart.dom.productList.appendChild(generateDOM);

      thisCart.products.push(new CartProduct(menuProduct,generateDOM));

      //console.log('thisCart.product:', thisCart.products);

      thisCart.update();
      thisCart.cartAnimation();

    }

    update(){
      const thisCart=this;

      const deliveryFee=settings.cart.defaultDeliveryFee;

      thisCart.totalNumber=0;
      thisCart.subtotalPrice=0;

      for(let product of thisCart.products){
        thisCart.totalNumber+=product.amountWidget.value;
        thisCart.subtotalPrice+=product.price
        //console.log(product.price);
      }
      if(thisCart.totalNumber>0){
        thisCart.totalPrice=thisCart.subtotalPrice+deliveryFee
        thisCart.deliveryFee=20;
      }else{
        thisCart.totalPrice=0;
        thisCart.deliveryFee=0
      }
      //console.log(totalNumber,thisCart.totalPrice,deliveryFee);

      thisCart.dom.deliveryFee.innerHTML=thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML=thisCart.subtotalPrice;

      for(let priceElem of thisCart.dom.totalPrice){
        priceElem.innerHTML=thisCart.totalPrice;
      }

      thisCart.dom.totalNumber.innerHTML=thisCart.totalNumber;

    }

    remove(cartProduct){
      const thisCart=this;

      //thisCart.cartAnimation();
      //remove product from HTML
      cartProduct.dom.wrapper.remove();

      //remove information about removed product: firs step: looking for index of product
      const index= thisCart.products.indexOf(cartProduct);
      if (index>-1){
        thisCart.products.splice(index,1);
      }
      //start update()
      thisCart.update();
      thisCart.cartAnimation();
    }

    sendOrder(){
      const thisCart=this;

      if (thisCart.products.length===0) {
        alert('Koszyk jest pusty! Przed wysłaniem zamówienia dodaj produkty do koszyka!')
        return;
      }

      const url = settings.db.url + '/' + settings.db.orders;

      const payload={
        address:thisCart.dom.address.value,
        phone:thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products:[],
      }

      for (let prod of thisCart.products){
        payload.products.push(prod.getData());
      }

      const options={
        method:"POST",
        headers:{
          'Content-Type':'application/json',
        },
         body:JSON.stringify(payload)
        };

      fetch(url,options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse',parsedResponse)

          thisCart.clearCart();
        });
    }

    clearCart(){
      const thisCart=this;

      thisCart.products=[];

      thisCart.dom.productList.innerHTML="";
      thisCart.dom.phone.value="";
      thisCart.dom.address.value="";

      thisCart.update();
      thisCart.cartAnimation();
    }

    cartAnimation(){
      const thisCart=this;
      const cartSummary=document.querySelector('.cart__summary');

      //console.log(cartSummary);

      if(thisCart.products.length>0){
        cartSummary.classList.add('cart__summary-active');
      } else {
        cartSummary.classList.remove('cart__summary-active');
      }
    }

  }

  export default Cart;