import Product from "../models/product.model.js";

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdWN5eEzAwDn6Q6z-pA5ZjYcUy6jhuD4MqikUrRiyh8g&s=1000",
    stock: 10,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation.",
    price: 4999,
    category: "Electronics",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQv6sCSGjrND-CobcOCoT8cbC_RGghXgyQ-LAEL3DHFg&s=1000",
    stock: 25,
  },
  {
    name: "Cotton T-Shirt",
    description: "Soft cotton t-shirt for everyday wear.",
    price: 799,
    category: "Fashion",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStSckqUo0LIVt7YwWJGzrhjzwueDT_U3IsHvvPR5Lg9A&s=1000",
    stock: 40,
  },
  {
    name: "Mystery Novel",
    description: "A page-turner mystery for weekend reading.",
    price: 399,
    category: "Books",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfwh6EpUNvNlltRe1ejPrNfmaq7orINkbG4NAdsycJ2Q&s=1000",
    stock: 15,
  },
  {
    name: "Table Lamp",
    description: "Warm LED table lamp for study and bedside use.",
    price: 1299,
    category: "Home",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ51bxXkRuAV2ebB3sP1b3c6DIN1v2Oy7H7CC3XC-A0-Q&s=1000",
    stock: 8,
  },
];

export const seedProducts = async () => {
  const cnt = await Product.countDocuments();

  if (cnt === 0) {
    await Product.insertMany(sampleProducts);
    console.log("seeded the sample products");
    return;
  }

  // products already in db so just fix the image if its different
  // (gets rid of any old placeholder / prev generated image)
  for (const item of sampleProducts) {
    await Product.updateOne(
      { name: item.name, image: { $ne: item.image } },
      { $set: { image: item.image } },
    );
  }
};
