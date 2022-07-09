const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router();

//favorites
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite){
            req.body.forEach(fv => {
                if(!favorite.campsites.includes(fv._id)){
                    favorite.campsites.push(fv._id);
                }
            })
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }else{
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on favorites');
  })
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        if(favorite){
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        }
        else{
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete')
        }

    })
    .catch(err => next(err))
})



//favorites with campsiteId
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions,(req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on ${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite){
            if(favorite.campsites.includes(req.params.campsiteId)){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.send('Campsite is already one of your favorites');
            }else{
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err))
            }
        }else {
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite){
            const updatedFavoritesList = favorite.campsites.filter(campsiteId => campsiteId.toString() !== req.params.campsiteId)
            console.log("new list", updatedFavoritesList)
             favorite.campsites = [...updatedFavoritesList]
             favorite.save()
            .then(favorite => {
                console.log(`Favorite Campsite ${favorite} deleted`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
            .catch(err => next(err))
        }else{
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`There are no favorites to delete`);
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;