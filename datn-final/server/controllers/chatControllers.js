const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const {
  createNewSheet,
  createNewSheetForGroup,
  readTotalSpending,
} = require("../googleSheet/googleSheetHandler");

const getChat = asyncHandler(async (req, res) => {
  const { userID, authID } = req.params;

  try {
    // Tìm đoạn chat có users chỉ chứa đúng [userID, authID]
    const chat = await Chat.findOne({
      users: { $all: [userID, authID], $size: 2 },
    });

    if (!chat) {
      return res
        .status(404)
        .json({ message: "No chat found with the specified users" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error finding chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { myId, userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: myId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users chatName", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  const sender = await User.findById(userId);

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: sender.name,
      isGroupChat: false,
      users: [myId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "chatName",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchChat = asyncHandler(async (req, res) => {
  // console.log(req.params.id);
  // console.log("czcxz");
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // users.push(req.user.id);

  // var mailUsers = []

  // for (const user of users) {
  //   const userData = await User.findById(user);
  //   mailUsers.push(userData.email);
  // }
  // TODO tạo sheet cho mỗi nhóm chat

  // const sheetId = await createNewSheet(mailUsers)

  // console.log(sheetId)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      // groupAdmin: req.user,
      // sheetId
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
      "users",
      "-password"
    );
    // .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createSheet = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const usersMail = req.user.email;

  const sheetId = await createNewSheet(usersMail);

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { sheetId },
    { new: true, runValidators: true }
  );

  if (!updatedChat) {
    return res.status(404).send({ message: "Chat not found" });
  }
  res.send({ sheetId });
});

// if (!req.body.users || !req.body.name) {
//   return res.status(400).send({ message: "Please Fill all the feilds" });
// }

// var users = JSON.parse(req.body.users);

// if (users.length < 2) {
//   return res
//     .status(400)
//     .send("More than 2 users are required to form a group chat");
// }

// // users.push(req.user.id);

// // var mailUsers = []

// // for (const user of users) {
// //   const userData = await User.findById(user);
// //   mailUsers.push(userData.email);
// // }
// // TODO tạo sheet cho mỗi nhóm chat

// // const sheetId = await createNewSheet(mailUsers)

// // console.log(sheetId)

// try {
//   const groupChat = await Chat.create({
//     chatName: req.body.name,
//     users: users,
//     isGroupChat: true,
//     // groupAdmin: req.user,
//     // sheetId
//   });

//   const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
//     "users",
//     "-password"
//   );
//   // .populate("groupAdmin", "-password");

//   res.status(200).json(fullGroupChat);
// } catch (error) {
//   res.status(400);
//   throw new Error(error.message);
// }
// });

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

// @desc    check xem chat với bản thân có chưa, có rồi thì trả về, chưa thì tạo mới chat users chỉ có bản thân mình
// @route   get /api/chat/myself
// @access  Protected
const mySelfChat = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const chat = await Chat.find({
    users: { $size: 1, $elemMatch: { $eq: userId } },
  });

  // console.log(chat);

  // nếu không có chat thì tạo chat
  if (chat.length == 0) {
    const newChat = await Chat.create({
      chatName: "My Self Chat",
      users: [userId],
      isGroupChat: false,
    });
    res.json(newChat);
  } else {
    res.json(chat);
  }
});

const getSpending = asyncHandler(async (req, res) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    if (chat.sheetId) {
      const spending = await readTotalSpending(chat.sheetId);
      res.json(spending);
    }
    else {
      res.json(0);
    }
  }
});
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  createSheet,
  mySelfChat,
  fetchChat,
  getSpending,
  getChat,
};
