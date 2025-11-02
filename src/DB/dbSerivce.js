export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return model.findOne(filter).select(select).populate(populate);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return model.find(filter).select(select).populate(populate);
};

export const findById = async ({
  model,
  id = "",
  select = "",
  populate = [],
} = {}) => {
  return model.findById(id).select(select).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return model.create(data, options);
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = { runValidators: true },
} = {}) => {
  return model.updateOne(filter, data, options);
};

export const findByIdAndUpdate = async ({
  model,
  id = "",
  data = {},
  options = { new: true, runValidators: true },
} = {}) => {
  return model.findByIdAndUpdate(id, data, options);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = { new: true, runValidators: true },
} = {}) => {
  return model.findOneAndUpdate(filter, data, options);
};
