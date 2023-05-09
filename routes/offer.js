const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
//  needed because by default express cant receive files as body,
// so we'll need a middleware: fileUpload. Then:
// req.body to get the text input and req.file for the file(s)
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();
router.use(express.json());

// IMPORT THE MODELS
const Offer = require("../model/Offer");
const User = require("../model/User");

// CONNECT TO CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// DECLARE FUNCTION
// to transform the picture file received as a 'buffer' into a base64,
// to then be able to upload to cloudinary
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// ROUTE 1 - PUBLISH A NEW OFFER
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // ***  CREATE NEW OFFER WITHOUT IMAGE
      // *** destructuring the parameters received in postman - no need for the images
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: Number(price),
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user, // req.user because it's defined in of the isAuthenticated function, and we've decided to only return the account info
        // and not the salt nor the hash
      });

      const imageUploaded = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        { folder: `/vinted/offers/${newOffer._id}` }
      );

      newOffer.product_image = imageUploaded;
      await newOffer.save();
      console.log(newOffer);
      res.status(200).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ROUTE 2 - MODIFY AN OFFER - ELSA but how to modify an image?
router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    const offerToModify = await Offer.findByIdAndUpdate(
      req.body._id,
      req.body,
      {
        new: true,
      }
    );
    await offerToModify.save();
    res.status(200).json({ offerToModify });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTE 3 - DISPLAY OFFER, FILTERING AND SORTING
router.get("/offers", async (req, res) => {
  try {
    let {
      title,
      priceMin = 0,
      priceMax = 100000,
      page = 1,
      articlesPerPage = 5,
      sort = "price-asc",
    } = req.query;
    skip = articlesPerPage * (page - 1);
    sort = sort.substring(6);
    let filters = { product_price: { $gte: priceMin, $lte: priceMax } };
    const regExp = new RegExp(title, "i");
    if (title) {
      filters.product_name = regExp;
    }
    const offers = await Offer.find(filters)
      .sort({ product_price: sort })
      // .select("product_name product_price")
      .skip(skip)
      .limit(articlesPerPage)
      .populate("owner", "account");
    const count = await Offer.countDocuments(filters);
    res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTE 4 - RETURNS SPECIFIC OFFER
router.get("/offer/:id", async (req, res) => {
  try {
    const offerById = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.status(200).json(offerById);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
