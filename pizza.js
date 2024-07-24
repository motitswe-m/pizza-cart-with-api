document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      title: "Pizza Cart API",
      pizzas: [],
      filteredPizzas: [],
      username: "",
      cartId: "",
      cartPizzas: [],
      cartTotal: 0.0,
      paymentAmount: 0.0,
      message: "",
      showPizzas: false, // Initially set to false

      login() {
        if (this.username.length > 2) {
          localStorage["username"] = this.username;
          this.createCart().then(() => {
            this.showPizzas = true; // Show pizzas after successful login
            this.loadPizzas();
          });
        } else {
          alert("Username is too short");
        }
      },

      logout() {
        if (confirm("Do you want to logout?")) {
          this.username = "";
          this.cartId = "";
          localStorage["cartId"] = "";
          localStorage["username"] = "";
          // this.showPizzas = false; // Hide pizzas on logout
        }
      },

      createCart() {
        if (!this.username) {
          this.cartId = "Please type in a username";
          return Promise.resolve();
        }

        const cartId = localStorage["cartId"];
        if (cartId) {
          this.cartId = cartId;
          return Promise.resolve();
        } else {
          const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
          return axios.get(createCartURL).then((result) => {
            this.cartId = result.data.cart_code;
            localStorage["cartId"] = this.cartId;
          });
        }
      },

      getCart() {
        const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
        return axios.get(getCartURL);
      },

      loadPizzas() {
        axios
          .get("https://pizza-api.projectcodex.net/api/pizzas")
          .then((result) => {
            this.pizzas = result.data.pizzas;
            this.filteredPizzas = this.pizzas; // Show all pizzas by default
          })
          .catch((error) => {
            console.error("Error fetching pizzas:", error);
          });
      },

      addPizza(pizzaId) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/add",
          {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          }
        );
      },

      removePizza(pizzaId) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/remove",
          {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          }
        );
      },

      pay(amount) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
          {
            cart_code: this.cartId,
            amount,
          }
        );
      },

      showCartData() {
        this.getCart()
          .then((result) => {
            const cartData = result.data;
            this.cartPizzas = cartData.pizzas;
            this.cartTotal = cartData.total.toFixed(2);
          })
          .catch((error) => {
            console.error("Error fetching cart:", error);
          });
      },

      init() {
        const storedUsername = localStorage["username"];
        if (storedUsername) {
          this.username = storedUsername;
          this.showPizzas = true; // Show pizzas if user is already logged in
          this.loadPizzas();
        }

        if (!this.cartId) {
          this.createCart().then(() => {
            this.showCartData();
          });
        }
      },

      addPizzaToCart(pizzaId) {
        this.addPizza(pizzaId).then(() => {
          this.showCartData();
        });
      },

      removePizzaFromCart(pizzaId) {
        this.removePizza(pizzaId).then(() => {
          this.showCartData();
        });
      },

      payForCart() {
        this.pay(this.paymentAmount).then((result) => {
          if (result.data.status === "failure") {
            this.message = result.data.message;
            setTimeout(() => (this.message = ""), 3000);
          } else {
            this.message = "Payment received";
            setTimeout(() => {
              this.message = "";
              this.cartPizzas = [];
              this.paymentAmount = 0;
              this.createCart();
              localStorage["cartId"] = "";
              this.cartTotal = 0.0;
              this.cartId = "";
            }, 3000);
          }
        });
      },

      filterSize(size) {
        this.filteredPizzas = this.pizzas.filter(
          (pizza) => pizza.size === size
        );
      },

      getImageUrl(size) {
        if (size === "small") return "path/to/small-pizza-image.jpg";
        if (size === "medium") return "path/to/medium-pizza-image.jpg";
        if (size === "large") return "path/to/large-pizza-image.jpg";
        return "path/to/default-pizza-image.jpg";
      },

      increaseQuantity(pizzaId) {
        alert(`Increase quantity of pizza with ID: ${pizzaId}`);
      },

      decreaseQuantity(pizzaId) {
        alert(`Decrease quantity of pizza with ID: ${pizzaId}`);
      },
    };
  });
});
