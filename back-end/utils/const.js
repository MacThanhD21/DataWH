const cubeRegistry = [
  {
    dims: ["Dim Time"],
    cube: "1D_Time",
  },
  {
    dims: ["Dim Item"],
    cube: "1D_Item",
  },
  {
    dims: ["Dim Customer"],
    cube: "1D_Customer",
  },
  {
    dims: ["Dim Time", "Dim Item"],
    cube: "2D_Time_Item",
  },
  {
    dims: ["Dim Time", "Dim Customer"],
    cube: "2D_Time_Customer",
  },
  {
    dims: ["Dim Item", "Dim Customer"],
    cube: "2D_Item_Customer",
  },
  {
    dims: ["Dim Time", "Dim Item", "Dim Customer"],
    cube: "3D_Time_Item_Customer",
  },
];

module.exports = {
  cubeRegistry,
};
