const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
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

// *** Fonction qui permet de transformer nos fichier qu'on reçois
// *** sous forme de Buffer en base64 afin de pouvoir les upload sur cloudinary
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
      // *** IDENTIFY USER USING THE TOKEN
      // console.log(req.headers.authorization);
      // DELETE const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(token);
      // DELETE const user = await User.findOne({ token }).select("-hash -salt"); // ELSA TO REDO
      // *** returns the body parameters EXCEPT the FILE
      // console.log(req.body);
      // ***returns the file, not under the format wanted
      // *** so we transform req.files into a String using the provided function that uses the mimetype
      // *** but also the data (the Buffer)
      // console.log(req.files);

      // ***  CREATE NEW OFFER WITHOUT IMAGE
      // *** destructuring the parameters received in postman - no need for the image
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      // console.log("req body : ", req.body)
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
      // console.log(imageUploaded);
      newOffer.product_image = imageUploaded;
      await newOffer.save();
      res.status(200).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ROUTE 2 - MODIFY AN OFFER - ELSA but how to modify an image?
router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.body);
    // const idToUpdate = req.body._id;
    // delete req.body.id;
    // console.log(req.body);
    // console.log(idToUpdate);
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

// ROUTE 4 - RETURNS OFFER, USING ID PROVIDED IN PARAMS
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
