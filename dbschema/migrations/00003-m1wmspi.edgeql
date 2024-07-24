CREATE MIGRATION m1wmspi45zcofkbhdgcyw7ber6bb7my5fjrjawkaaavz7mfacxhbvq
    ONTO m1p7vlotddqfxwuoabsqqxdlsd4tpgrvql4wrd72pmn3gjvsio4d3q
{
  CREATE SCALAR TYPE default::ParameterType EXTENDING enum<Number, Boolean, String>;
  CREATE TYPE default::ModelIterationParameters {
      CREATE REQUIRED PROPERTY datatype: default::ParameterType;
      CREATE REQUIRED PROPERTY default_value: std::str;
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE default::ModelIteration {
      CREATE MULTI LINK parameters: default::ModelIterationParameters;
  };
};
