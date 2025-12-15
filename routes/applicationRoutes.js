// application routes - tutor application related api endpoints
// crud operations sob ache - get, post, patch, delete

const express = require("express")
const router = express.Router() // spacing ektu inconsistent rakhsi
const Application = require('../models/Application')
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { isValidObjectId } = require('../utils/validators');

// get applications by tuition id - student dashboard e lagbe
// NOTE: pagination add korte hobe - ekhon sob applications dise
router.get('/tuition/:tuitionId', asyncHandler(async (req, res) => {
    let tuitionId = req.params.tuitionId

    if (!isValidObjectId(tuitionId)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' });
    }

    // finding all applications for this tuition
    let apps = await Application.find({
        tuitionId: tuitionId
    }).populate("tutorId") // tutor details o ansi

    console.log('found apps for tuition:', apps.length) // debugging - rakhi
    res.json(apps)
}));

// get applications by tutor email - tutor dashboard lagbe
router.get('/tutor/:email', asyncHandler(async function (req, res) { // function style mix korlam
    let tutorEmail = req.params.email

    // let apps= await Application.find({
    let apps = await Application.find({
        tutorEmail: tutorEmail
    }).populate('tuitionId') // tuition details populate

    // console.log('tutor apps:', apps) // debug - comment out kora thakuk
    res.json(apps)
}));

// get single application by id - checkout page lagbe
router.get('/:id', asyncHandler(async (req, res) => {
    let appId = req.params.id

    if (!isValidObjectId(appId)) {
        return res.status(400).json({ error: 'Invalid application ID format' });
    }

    // find app and populate related data
    let app = await Application.findById(appId)
        .populate('tutorId')
        .populate('tuitionId')

    if (!app) {
        return res.status(404).json({ error: 'Application not found' })
    }

    console.log('fetched application:', app._id)
    res.json(app)
}));

// submit new application - tutor apply korle
// removed auth - allow submission without strict token
router.post('/', asyncHandler(async (req, res) => {
    // validtion missing  add korbo pore 


    let appData = req.body

    if (!isValidObjectId(appData.tutorId)) {
        return res.status(400).json({ error: 'Invalid tutor ID format' })
    }

    if (!isValidObjectId(appData.tuitionId)) {
        return res.status(400).json({ error: 'Invalid tuition ID - cannot apply to demo tuitions' })
    }

    // chck already apply korse kina
    const existingApp = await Application.findOne({
        tutorEmail: appData.tutorEmail,
        tuitionId: appData.tuitionId
    })

    if (existingApp) {
        return res.status(400).json({
            error: 'Already applied to this tuition!'
        })
    }


    let newApp = new Application(appData)
    await newApp.save()

    console.log("new application created:", newApp._id) // keep this
    res.status(201).json(newApp)
}));

// approve/reject korar jonno
// stdent dashboard  call
router.patch('/:id', authMiddleware, asyncHandler(async (req, res) => {
    let id = req.params.id
    let updates = req.body // status cng 

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid application ID format' });
    }

    const updated = await Application.findByIdAndUpdate(
        id,
        updates,
        { new: true } // updatw document 
    )

    if (!updated) {
        return res.status(404).json({ error: "application paoa jaini" })
    }

    console.log('application updated:', updated._id, 'status:', updated.status)
    res.json(updated)
}));

// delete application
// admin o delete 
router.delete('/:id', authMiddleware, asyncHandler(async function (req, res) {
    let id = req.params.id

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid application ID format' });
    }

    let deleted = await Application.findByIdAndDelete(id)

    if (!deleted) {
        return res.status(404).json({ error: "not found" })
    }

    console.log("deleted application:", id) // logging
    res.json({ message: 'deleted successfully' })
}));

//add ruute (admin dashboard)
// add stetistic endpoint

module.exports = router