/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };



  class Product {
    //constructor=create a new object
    constructor(id,data){
      const thisProduct=this; //every single product

      thisProduct.id=id;// np pizza
      thisProduct.data=data;//np price, name, params:

      thisProduct.renderInMenu(); //rendering products on the website
      thisProduct.getElements(); //get DOM elements
      thisProduct.initAccordion(); // folding and unfolding products

      thisProduct.initOrderForm();//setting up the order form
      //calculating price of the products

      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      //console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct=this;

      /* generate HTML based on template */
      const generateHTML =templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */

      const menuContainer=document.querySelector(select.containerOf.menu);

      /* add element to menu */

      menuContainer.appendChild(thisProduct.element)
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom={};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);

      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);

      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

      thisProduct.dom.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.dom.amountWidgetElem=thisProduct.element.querySelector(select.menuProduct.amountWidget);

      //console.log(thisProduct.amountWidgetElem);
    }



    initAccordion(){
      const thisProduct=this;

      /* START: add event listener to clickable trigger on event click */

      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        console.log('clicked');

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct=document.querySelector(select.all.menuProductsActive);

        //console.log(activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct && activeProduct !== thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('Method:initOrderForm');

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('Method:processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //check if the option is selected in the form data

          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected){
            //if the option is selected and not default, add its price
            if(!option.default){
              price+=option.price;
            }
          } else {
            // if option is not selected but is default, subtracy its price
            if (option.default)
              price-=option.price;
          }

          const optionImage=thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if (optionImage){
            if (optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;
      //multiply price by amount
      price*=thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct=this;

      thisProduct.amountWidget= new AmountWidget(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });

    }

    addToCart(){
      const thisProduct=this;

      const cartProduct=thisProduct.prepareCartProduct();

      app.cart.add(cartProduct);

      thisProduct.resetToDefault();

    }

    resetToDefault() {
      const thisProduct=this;

      thisProduct.dom.form.reset();
      thisProduct.amountWidget.setValue(settings.amountWidget.defaultValue);

      thisProduct.processOrder();
    }

    prepareCartProduct(){
      const thisProduct=this;

      const productSummary={
        id:thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        priceSingle:thisProduct.priceSingle,
        price:thisProduct.priceSingle*thisProduct.amountWidget.value,
        params:thisProduct.prepareCartProductParams(),
      };
      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};

      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }

        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            params[paramId].options[optionId] = option.label
          }
        }
      }
      return params;
    }
  }

class AmountWidget {
  constructor(element){
    const thisWidget=this;

    //console.log('AmountWidhet: ',thisWidget);
    //console.log('constructor arguments: ',element);


    thisWidget.getElements(element);

    if (thisWidget.input.value){
      thisWidget.setValue(thisWidget.input.value)
    }
    else {
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }

    thisWidget.initActions();

  }

  getElements(element){
    const thisWidget=this;

    thisWidget.element=element;

    thisWidget.input=thisWidget.element.querySelector(select.widgets.amount.input);

    thisWidget.linkDecrease=thisWidget.element.querySelector(select.widgets.amount.linkDecrease);

    thisWidget.linkIncrease=thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget=this;

    const newValue=parseInt(value);

     /* TODO: Add validation */

    if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value=newValue;
      thisWidget.announce();
    }
    thisWidget.input.value=thisWidget.value;
  }

  initActions(){
    const thisWidget=this;

    thisWidget.input.addEventListener('change', function(){thisWidget.setValue(thisWidget.input.value)
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1)
    });

    thisWidget.linkIncrease.addEventListener('click', function (event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1)
    });

  }
  announce(){
    const thisWidget=this;

    const event=new CustomEvent('updated', {
      bubbles:true
    });
    thisWidget.element.dispatchEvent(event);

  }
}

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

    thisCart.dom.phone.addEventListener('input', function(){
      thisCart.validatePhone();
    });

    thisCart.dom.address.addEventListener('input',function(){
      thisCart.validateAddress();
    })

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
      console.log(product.price);
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

    if(!thisCart.validatePhone()||!thisCart.validateAddress){
      return false;
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

  validatePhone(){
    const thisCart=this;

    if(thisCart.dom.phone.value.length<9){
      thisCart.dom.phone.classList.add('error');
      thisCart.dom.phone.setAttribute('title','Minimalna długość znaków to 9');
      return false;
    } else {
      thisCart.dom.phone.classList.remove('error');
    }
    return true
  }

  validateAddress(){
    const thisCart=this;
    if(thisCart.dom.address.value.length<5){
      thisCart.dom.address.classList.add('error');
      thisCart.dom.address.setAttribute('title','Minimalna długość znaków to 5');
      return false;
    } else {
      thisCart.dom.address.classList.remove('error');
    }
    return true;
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

    console.log(cartSummary);

    if(thisCart.products.length>0){
      cartSummary.classList.add('cart__summary-active');
    } else {
      cartSummary.classList.remove('cart__summary-active');
    }
  }

}

class CartProduct {
  constructor(menuProduct,element){
    const thisCartProduct=this;

    thisCartProduct.id=menuProduct.id;
    thisCartProduct.name=menuProduct.name;
    thisCartProduct.amountWidget=menuProduct.amount;
    thisCartProduct.priceSingle=menuProduct.priceSingle;
    thisCartProduct.price=menuProduct.price;
    thisCartProduct.params=menuProduct.params;

    thisCartProduct.getElements(element);
    //console.log(thisCartProduct);

    thisCartProduct.initAmountWidget()
    thisCartProduct.initActions();

  }

  getElements(element){
    const thisCartProduct=this;
    thisCartProduct.dom={};

    thisCartProduct.dom.wrapper=element;

    thisCartProduct.dom.amountWidget=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    console.log(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.price=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove=thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }

  initAmountWidget(){
    const thisCartProduct=this;

    thisCartProduct.amountWidget= new AmountWidget(thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct=this;

    const event=new CustomEvent('remove',{
      bubbles:true,
      detail: {
        cartProduct:thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('start remove');
  }

  initActions(){
    const thisCartProduct=this;

    thisCartProduct.dom.edit.addEventListener('click',function(event){
      event.preventDefault();
      /////
    })

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    })
  }

  getData(){
    const thisCartProduct=this;

    return {
      id:thisCartProduct.id,
      name:thisCartProduct.name,
      amount:thisCartProduct.amount,
      price:thisCartProduct.price,
      priceSingle:thisCartProduct.priceSingle,
      params:thisCartProduct.params,
    }
  }
}

  const app = {

    initMenu: function (){
      // this method create for every product ,,new Product"->menu
      const thisApp=this;

      //console.log('thisApp.data:',thisApp.data);

      for (let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    //get data from dataSource (data.js);
    initData: function (){
      const thisApp=this;

      thisApp.data={};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          //console.log('parsedResponse',parsedResponse);

          //save parsedresponse as thisApp.data.products
          thisApp.data.products=parsedResponse;

          //execute initMenu method
          thisApp.initMenu();
        });

        //console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp=this;

      const cartElem=document.querySelector(select.containerOf.cart);
      thisApp.cart=new Cart (cartElem);
    }
  };

  //start app (the first step)
  app.init();
}
