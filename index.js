const express = require('express');
const mongoose = require('mongoose');

const {configs} = require("./constants");
const {userRouter, authRouter} = require("./routes");

mongoose.connect(configs.URL_DB);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/users', userRouter);
app.use('/auth', authRouter);

app.use('*', (req, res) => {
    res.status(404).json('Router not found');
})

app.use((err,req, res, next) => {
    res
        .status(err.status || 500)
        .json({
            error: err.message || 'Unknown error',
            code: err.status || 500
        })
})

app.listen(configs.PORT, () => {
    console.log(`Server started port ${configs.PORT}`);
})
