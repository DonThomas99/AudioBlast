const User = require('../Models/userModel');

exports.checkforduplicates = async(req,res,next) =>{
    try {
        const userId = req.session.user_id;
        const pdtId = req.query.id;
        
        // Check if user exists and if product is already in wishlist
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if product is already in wishlist
        if (user.wishlist.includes(pdtId)) {
            // Product already exists in wishlist, redirect with message
            return res.redirect(`/loadProductDetail/${pdtId}?message=Product already in wishlist`);
        }
        
        // Product not in wishlist, proceed to next middleware/controller
        next();
        
    } catch (error) {
        console.log('Error in checkforduplicates middleware:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}