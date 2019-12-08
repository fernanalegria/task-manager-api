const HttpStatus = require("http-status-codes");
const express = require("express");
const { auth } = require("../middleware");

const badRequestErrors = ["ValidationError", "CastError"];

const getErrorResponse = e => {
  const statusCode = badRequestErrors.includes(e.name)
    ? HttpStatus.BAD_REQUEST
    : HttpStatus.SERVICE_UNAVAILABLE;
  const error = e.errmsg ? e.errmsg : e.message;
  return { error, statusCode };
};

const hasOwner = ModelClass =>
  Object.keys(ModelClass.schema.paths).includes("owner");

const createDocument = async (ModelClass, document, user, res) => {
  if (hasOwner(ModelClass)) {
    document.owner = user._id;
  }
  const instance = new ModelClass(document);
  try {
    const document = await instance.save();
    res.status(HttpStatus.CREATED).send(document);
  } catch (e) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: e.message });
  }
};

const getAllDocuments = async (ModelClass, user, res) => {
  try {
    const search = {};
    if (hasOwner(ModelClass)) {
      search.owner = user._id;
    }
    const allDocuments = await ModelClass.find(search);
    res.status(HttpStatus.OK).send(allDocuments);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
};

const getDocumentById = async (ModelClass, id, user, res) => {
  try {
    const search = { _id: id };
    if (hasOwner(ModelClass)) {
      search.owner = user._id;
    }
    const document = await ModelClass.findOne(search);
    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }
    res.status(HttpStatus.OK).send(document);
  } catch (e) {
    const { error, statusCode } = getErrorResponse(e);
    res.status(statusCode).send({ error });
  }
};

const updateDocument = async (
  ModelClass,
  id,
  user,
  updates,
  res,
  allowedUpdates = []
) => {
  const updateFields = Object.keys(updates);
  if (allowedUpdates.length > 0) {
    const invalidUpdates = updateFields.filter(
      update => !allowedUpdates.includes(update)
    );
    if (invalidUpdates.length > 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: `Invalid updates: ${invalidUpdates}` });
    }
  }

  try {
    const search = { _id: id };
    if (hasOwner(ModelClass)) {
      search.owner = user._id;
    }
    let document = await ModelClass.findOne(search);

    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }

    updateFields.forEach(field => {
      document[field] = updates[field];
    });
    document = await document.save();
    res.status(HttpStatus.OK).send(document);
  } catch (e) {
    const { error, statusCode } = getErrorResponse(e);
    res.status(statusCode).send({ error });
  }
};

const deleteDocument = async (ModelClass, id, user, res) => {
  try {
    const search = { _id: id };
    if (hasOwner(ModelClass)) {
      search.owner = user._id;
    }
    const document = await ModelClass.findOneAndRemove(search);
    if (!document) {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Document not found in collection ${ModelClass.collection.name}`
      });
    }
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (e) {
    const { error, statusCode } = getErrorResponse(e);
    res.status(statusCode).send({ error });
  }
};

const getRouter = (ModelClass, methods, options) => {
  const router = new express.Router();
  return updateRouter(router, ModelClass, methods, options);
};

const updateRouter = (router, ModelClass, methods, options = {}) => {
  if (methods.create) {
    router.post("", auth, (req, res) => {
      createDocument(ModelClass, req.body, req.user, res);
    });
  }

  if (methods.readAll) {
    router.get("", auth, (req, res) => {
      getAllDocuments(ModelClass, req.user, res);
    });
  }

  if (methods.readDetail) {
    router.get("/:id", auth, (req, res) => {
      getDocumentById(ModelClass, req.params.id, req.user, res);
    });
  }

  if (methods.update) {
    router.patch("/:id", auth, (req, res) => {
      updateDocument(
        ModelClass,
        req.params.id,
        req.user,
        req.body,
        res,
        options.allowedUpdates
      );
    });
  }

  if (methods.delete) {
    router.delete("/:id", auth, (req, res) => {
      deleteDocument(ModelClass, req.params.id, req.user, res);
    });
  }

  return router;
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getErrorResponse,
  getRouter,
  updateRouter
};
