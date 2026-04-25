// user service - db queries for users
// all user related db ops here
const User = require('../models/User');
const AppError = require('../utils/AppError');

// get all - admin only usually
const getAllUsers = async () => {
    const users = await User.find();
    return users;
};

// find by email - main lookup method
const getUserByEmail = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user; // returns null if not found - caller decides if thats an error
};

// find by id
const getUserById = async (id) => {
    const user = await User.findById(id);
    return user;
};

// upsert user - atomic create-or-return, prevents E11000 on concurrent requests
const createUser = async (userData) => {
    // Security check: cant register as admin directly
    let role = userData.role || 'student';
    if (role === 'admin') {
        role = 'student';
    }

    const email = userData.email.toLowerCase();

    // Use findOneAndUpdate with upsert so concurrent calls never cause duplicate key errors.
    // setOnInsert only applies fields when a NEW document is being created.
    const user = await User.findOneAndUpdate(
        { email },
        {
            $setOnInsert: {
                email,
                displayName: userData.displayName || email.split('@')[0],
                photoURL: userData.photoURL || '',
                mobileNumber: userData.mobileNumber || '',
                role
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return user;
};

// update user by id
const updateUser = async (id, updateData) => {
    const updated = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw AppError.notFound('User');
    }
    return updated;
};

// update by email - profile update e use hoy
const updateUserByEmail = async (email, updateData) => {
    const updated = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        updateData,
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw AppError.notFound('User');
    }
    return updated;
};

// delete - admin only
const deleteUser = async (id) => {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
        throw AppError.notFound('User');
    }
    return deleted;
};

// upgrade student to tutor - one way only
const upgradeToTutor = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw AppError.notFound('User');
    }

    if (user.role === 'student') {
        user.role = 'tutor';
        await user.save();
    }

    return user;
};

// check user exists - quick check
const userExists = async (email) => {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
};

module.exports = {
    getAllUsers,
    getUserByEmail,
    getUserById,
    createUser,
    updateUser,
    updateUserByEmail,
    deleteUser,
    upgradeToTutor,
    userExists
};
