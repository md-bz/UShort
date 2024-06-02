const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document) {
            return next(new AppError("No document with that id", 404));
        }

        res.status(204).json({
            status: "success",
            data: {},
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!document) {
            return next(new AppError("No document with that id", 404));
        }
        res.status(200).json({
            status: "success",
            data: { document },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res) => {
        const document = await Model.create(req.body);

        res.status(201).json({ status: "success", data: { document } });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const query = populateOptions
            ? Model.findById(req.params.id).populate(populateOptions)
            : Model.findById(req.params.id);
        const document = await query;

        if (!document) {
            return next(new AppError("No document with that id", 404));
        }

        res.status(200).json({
            status: "success",
            data: { document },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res) => {
        const features = new APIFeatures(Model.find({}), req.query)

            .filter()
            .sort()
            .limitFields()
            .paginate();
        const document = await features.query;

        res.status(200).json({
            status: "success",
            requestTime: req.responseTime,
            results: document.length,
            data: { document },
        });
    });

exports.getMany = (
    Model,
    findQuery = {},
    populateString = "",
    populateSelect = ""
) =>
    catchAsync(async (req, res) => {
        for (o in findQuery) {
            findQuery[o] = eval(findQuery[o]);
        }
        const features = new APIFeatures(
            Model.find(findQuery).populate(populateString, populateSelect),
            req.query
        )

            .filter()
            .sort()
            .limitFields()
            .paginate();
        const document = await features.query;

        res.status(200).json({
            status: "success",
            requestTime: req.responseTime,
            results: document.length,
            data: { document },
        });
    });
