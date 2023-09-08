exports.isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id)
        {
            if(req.session.is_blocked === 0)
            {
                next()
            }
            else{
                res.session.destroy()
                res.redirect('/')
                
            }
        }
        else{
            res.redirect('/login')
        }
    } catch (error) {
        
    }
}
exports.isLogOut= async(req,res,next)=>{
    try {
        if(req.session.user_id)
        {   
            console.log('yes');
           // req.session.destroy()
            res.redirect('/')
        }
        else{
        next()
        }
    } catch (error) {
        
    }
}
