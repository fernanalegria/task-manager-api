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

const createDocument = async (ModelClass, body, user, res) => {
  const document = Object.keys(ModelClass.schema.paths).includes("owner")
    ? { ...body, owner: user._id }
    : body;
  const instance = new ModelClass(document);
  try {
    const document = await instance.save();
    res.status(HttpStatus.CREATED).send(document);
  } catch (e) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: e.message });
  }
};

const getAllDocuments = async (ModelClass, res) => {
  try {
    const allDocuments = await ModelClass.find({});
    res.status(HttpStatus.OK).send(allDocuments);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
};

const getDocumentById = async (ModelClass, id, res) => {
  try {
    const document = await ModelClass.findById(id);
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
    let document = await ModelClass.findById(id);

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

const deleteDocument = async (ModelClass, id, res) => {
  try {
    const document = await ModelClass.findByIdAndRemove(id);
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
    router.get("", auth, (_req, res) => {
      getAllDocuments(ModelClass, res);
    });
  }

  if (methods.readDetail) {
    router.get("/:id", auth, (req, res) => {
      getDocumentById(ModelClass, req.params.id, res);
    });
  }

  if (methods.update) {
    router.patch("/:id", auth, (req, res) => {
      updateDocument(
        ModelClass,
        req.params.id,
        req.body,
        res,
        options.allowedUpdates
      );
    });
  }

  if (methods.delete) {
    router.delete("/:id", auth, (req, res) => {
      deleteDocument(ModelClass, req.params.id, res);
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
