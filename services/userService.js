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
    const user = await User.findOne({ email });
    return user; // returns null if not found - caller decides if thats an error
};

// find by id
const getUserById = async (id) => {
    const user = await User.findById(id);
    return user;
};

// create user - admin role block kora ache
const createUser = async (userData) => {
    // Security check: cant register as admin directly
    let role = userData.role || 'student';
    if (role === 'admin') {
        role = 'student';  // downgrade to student
    }

    const newUser = new User({
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL || '',
        mobileNumber: userData.mobileNumber || '',
        role: role
    });

    await newUser.save();
    return newUser;
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
        { email },
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
    const user = await User.findOne({ email });
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
    const count = await User.countDocuments({ email });
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
