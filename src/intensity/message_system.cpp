
// Copyright 2010 Alon Zakai ('kripken'). All rights reserved.
// This file is part of Syntensity/the Intensity Engine, an open source project. See COPYING.txt for licensing.

#ifndef STANDALONE
    #include "cube.h"
    #include "engine.h"
    #include "game.h"
#else
    #include "cube.h"
    #include "iengine.h"
    #include "igame.h"
#endif

#include "server_system.h"
#include "message_system.h"


namespace MessageSystem
{

// MessageType

void MessageType::receive(int receiver, int sender, ucharbuf &p)
{
    Logging::log(Logging::ERROR, "Trying to receive a message, but no handler present: %s (%d)\r\n", type_name.c_str(), type_code);
    assert(0);
}


// MessageManager

MessageManager::MessageMap MessageManager::messageTypes;

void MessageManager::registerMessageType(MessageType *newMessageType)
{
    Logging::log(Logging::DEBUG, "MessageSystem: Registering message %s (%d)\r\n",
                                 newMessageType->type_name.c_str(),
                                 newMessageType->type_code);

    assert(messageTypes.find(newMessageType->type_code) == messageTypes.end()); // We cannot have duplicate message types

    messageTypes[newMessageType->type_code] = newMessageType;
}

bool MessageManager::receive(int type, int receiver, int sender, ucharbuf &p)
{
    Logging::log(Logging::DEBUG, "MessageSystem: Trying to handle a message, type/sender:: %d/%d\r\n", type, sender);
    INDENT_LOG(Logging::DEBUG);

    MessageMap::iterator messageType = messageTypes.find(type);
    if (messageType == messageTypes.end())
    {
        Logging::log(Logging::DEBUG, "Message type not found in our extensions to Sauer: %d\r\n", type);
        return false; // This isn't one of our messages, hopefully it's a sauer one
    }

    messageType->second->receive(receiver, sender, p);

    Logging::log(Logging::DEBUG, "MessageSystem: message successfully handled\r\n");

    return true;
}

std::string awaitedFile = "";

void MessageManager::awaitFile(std::string name)
{
    assert(awaitedFile == "");

    awaitedFile = name;

    Logging::log(Logging::DEBUG, "Awaiting file '%s'\r\n", awaitedFile.c_str());
}

std::string MessageManager::getAwaitingFile()
{
    assert(awaitedFile != "");

    Logging::log(Logging::DEBUG, "No longer awaiting file '%s'\r\n", awaitedFile.c_str());

    std::string ret = awaitedFile;
    awaitedFile = "";
    return ret;
}

}

