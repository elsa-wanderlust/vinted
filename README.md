# DATABASE

connected to a Mongoose DB 'Vinted' with 2 collections: users and offers  
2 models have been declared for the Mongoose DB: users and offers

# PICTURES

both users' avatar and offers' pictures are stored on Cloudinary

# ROUTES

there are 2 categories of routes:

## OFFER ROUTES:

- PUBLISH A NEW OFFER  
   "/offer/publish"  
   as post  
   parameters as XXX
  uses a middle 'isAuthenticated'  
  &nbsp;
- MODIFY AN OFFER  
  "/offer/update"  
  as put  
  parameters as XXX
  uses a middle 'isAuthenticated'  
   &nbsp;
- DISPLAY OFFER, FILTERING AND SORTING  
  "/offers"  
  as get  
  parameters as XXX  
  &nbsp;
- RETURNS OFFER, USING ID PROVIDED IN PARAMS  
  "/offer/:id"  
  as get  
  parameter as params

## USER ROUTES:

- SIGNUP  
  "/user/signup"  
  as post  
  parameters as XXX  
   &nbsp;
- LOGIN  
  "/user/login"  
  as post  
  parameters as XXX
