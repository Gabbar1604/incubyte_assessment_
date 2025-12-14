class SweetShop:
    def __init__(self):
        self.sweets = []

    def add_sweet(self, name, price, quantity):
        self.sweets.append({
            "name": name,
            "price": price,
            "quantity": quantity
        })

    def purchase(self, name):
        for sweet in self.sweets:
            if sweet["name"] == name:
                if sweet["quantity"] <= 0:
                    raise ValueError("Out of stock")
                sweet["quantity"] -= 1
                return
