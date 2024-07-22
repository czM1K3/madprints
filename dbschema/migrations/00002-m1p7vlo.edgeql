CREATE MIGRATION m1p7vlotddqfxwuoabsqqxdlsd4tpgrvql4wrd72pmn3gjvsio4d3q
    ONTO m17f6bfk5m6v2cuikrak3a66piznug27jppuu43bl55cxfsbrvzmpa
{
  ALTER TYPE default::Model {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
  ALTER TYPE default::ModelIteration {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
  };
};
