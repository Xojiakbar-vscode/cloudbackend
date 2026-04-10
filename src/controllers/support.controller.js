const { SupportMessage, SupportReply, User } = require('../models');

exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const user_id = req.user ? req.user.id : null;

    const newMessage = await SupportMessage.create({
      user_id,
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      status: 'success',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllMessages = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const where = isAdmin ? {} : { user_id: req.user.id };

    const messages = await SupportMessage.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: SupportReply,
          as: 'replies',
          order: [['created_at', 'ASC']],
        }
      ],
    });

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

exports.addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const isAdmin = req.user.role === 'admin';

    const thread = await SupportMessage.findByPk(id);
    if (!thread) {
      return res.status(404).json({ message: 'Murojaat topilmadi' });
    }

    // Check permissions
    if (!isAdmin && thread.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Sizda bu murojaatga javob berish huquqi yo\'q' });
    }

    const reply = await SupportReply.create({
      support_message_id: id,
      sender_id: req.user.id,
      message,
      is_admin: isAdmin,
    });

    // Update thread status if admin replies
    if (isAdmin) {
      thread.status = 'responded';
      await thread.save();
    } else {
      thread.status = 'pending';
      await thread.save();
    }

    res.status(201).json({
      status: 'success',
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await SupportMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Xabar topilmadi' });
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      status: 'success',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
