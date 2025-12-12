// application routes - tutor application related api endpoints
// crud operations sob ache - get, post, patch, delete

const express = require("express")
const router = express.Router() // spacing ektu inconsistent rakhsi
const Application = require('../models/Application')

// get applications by tuition id - student dashboard e lagbe
// NOTE: pagination add korte hobe - ekhon sob applications dise
router.get('/tuition/:tuitionId', async (req, res) => {
    try {
        let tuitionId = req.params.tuitionId

        // finding all applications for this tuition
        let apps = await Application.find({
            tuitionId: tuitionId
        }).populate("tutorId") // tutor details o ansi

        console.log('found apps for tuition:', apps.length) // debugging - rakhi
        res.json(apps)
    } catch (error) {
        console.error("error in /tuition/:id:", error)
        res.status(500).json({ error: 'server error hoise' })
    }
})

// get applications by tutor email - tutor dashboard lagbe
router.get('/tutor/:email', async function (req, res) { // function style mix korlam
    try {
        let tutorEmail = req.params.email

        // let apps= await Application.find({
        let apps = await Application.find({
            tutorEmail: tutorEmail
        }).populate('tuitionId') // tuition details populate

        // console.log('tutor apps:', apps) // debug - comment out kora thakuk
        res.json(apps)
    } catch (err) { // err instead of error - inconsistent
        console.error(err)
        res.status(500).json({ error: "failed to get applications" })
    }
})

// get single application by id - checkout page lagbe
router.get('/:id', async (req, res) => {
    try {
        let appId = req.params.id

        // find app and populate related data
        let app = await Application.findById(appId)
            .populate('tutorId')
            .populate('tuitionId')

        if (!app) {
            return res.status(404).json({ error: 'Application not found' })
        }

        console.log('fetched application:', app._id) // debug log
        res.json(app)
    } catch (error) {
        console.error('error fetching application:', error)
        res.status(500).json({ error: 'server error' })
    }
})

// submit new application - tutor apply korle
// TODO: add validation - check if already applied
// TODO: send notification to student
router.post('/', async (req, res) => {
    try {
        // validation missing - add korbo pore bhaiya said
        // ekhon just save kori

        let appData = req.body

        // check kori already apply korse kina - duplicate avoid
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
    } catch (error) {
        console.error('application create error:', error)
        res.status(500).json({ error: error.message })
    }
})

// update application status - approve/reject korar jonno
// student dashboard theke call hobe
router.patch('/:id', async (req, res) => {
    try {
        let id = req.params.id
        let updates = req.body // usually status change hobe

        const updated = await Application.findByIdAndUpdate(
            id,
            updates,
            { new: true } // updated document return korbe
        )

        if (!updated) {
            return res.status(404).json({ error: "application paoa jaini" })
        }

        console.log('application updated:', updated._id, 'status:', updated.status)
        res.json(updated)
    } catch (err) {
        console.error("update error:", err)
        res.status(500).json({ error: 'update failed' })
    }
})

// delete application - tutor cancel korte pare
// admin o delete korte parbe
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id

        let deleted = await Application.findByIdAndDelete(id)

        if (!deleted) {
            return res.status(404).json({ error: "not found" })
        }

        console.log("deleted application:", id) // logging
        res.json({ message: 'deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "deletion failed" })
    }
})

// TODO: add rute for getting all applications (admin dashboard)
// TODO: add statistics endpoint - count by status

module.exports = router
