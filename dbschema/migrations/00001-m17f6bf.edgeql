CREATE MIGRATION m17f6bfk5m6v2cuikrak3a66piznug27jppuu43bl55cxfsbrvzmpa
    ONTO initial
{
  CREATE TYPE default::ModelIteration {
      CREATE REQUIRED PROPERTY code: std::str;
      CREATE REQUIRED PROPERTY number: std::int32;
  };
  CREATE TYPE default::Model {
      CREATE MULTI LINK iterations: default::ModelIteration;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
  };
};
