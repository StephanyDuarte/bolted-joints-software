from database import Database


class SGBD:
    def __init__(self):
        self.db = Database('bj_software', 'SENHA')
    
    
    def connect_db(self):
        return self.db.create_db_connection()
    
    
    def retrieve_data_from_query(self, query):
        conn = self.connect_db()
        try :
            results = self.db.read_query(conn, query)
            
        except Exception as err:
            print(err)
        
        return [0] if not len(results) else [res[0] for res in results]
        
    
    
    def search_by_filter(self, table, out_col, filter_col, filtered):
        query = f"""
            SELECT  {out_col}
            FROM {table}
            WHERE {table}.{filter_col} = {filtered};
            """
        return self.retrieve_data_from_query(query)

    
    def all_dim_screw(self):
        query = """
            SELECT DISTINCT dim_screw
            FROM metric_threads
            """        
        return self.retrieve_data_from_query(query)


    def alcomprimentoParafuso_materials(self):
        query = """
            SELECT material
            FROM stiffness_materials
            """
        return self.retrieve_data_from_query(query)


    def filter_pitch(self, filtered):
        table = 'metric_threads'
        col_output = 'pitch'
        filter_col = 'dim_screw'
        return self.search_by_filter(table, col_output, filter_col, filtered)
       
       
    def filter_a_t(self, filtered):
        table = 'metric_threads'
        col_output = 'traction_area'
        filter_col = 'pitch'
        return self.search_by_filter(table, col_output, filter_col, filtered)
       
        
    def filter_elasticy(self, filtered):
        table = 'stiffness_materials'
        col_output = 'elasticity'
        filter_col = 'material'
        return self.search_by_filter(table, col_output, filter_col, f"'{filtered}'")


    def filter_height_nut(self, filtered):
        table = 'hex_nuts'
        col_output = 'height_nut'
        filter_col = 'dim_nuts'
        return self.search_by_filter(table, col_output, filter_col, filtered)

    def filter_classe_metrica(self):
        query = """
            SELECT classe_metrica
            FROM resistencia_minima
            """
        return self.retrieve_data_from_query(query)
    
    
    def filter_tensao_escoamento(self, classe_metrica):
        query = f"""
            SELECT tensao_escoamento 
            FROM resistencia_minima 
            WHERE resistencia_minima.classe_metrica = '{classe_metrica}';
        """
        return self.retrieve_data_from_query(query)

       
    def filter_tensao_ruptura(self, classe_metrica):
        query = f"""
            SELECT tensao_ruptura 
            FROM resistencia_minima 
            WHERE resistencia_minima.classe_metrica = '{classe_metrica}';
        """
        return self.retrieve_data_from_query(query)
       
    def filter_tensao_prova(self, classe_metrica):
        query = f"""
            SELECT tensao_prova 
            FROM resistencia_minima 
            WHERE resistencia_minima.classe_metrica = '{classe_metrica}';
        """
        return self.retrieve_data_from_query(query)
       
       
       
    def filter_resistencia(self, filtered):
        table = 'limite_fadiga'
        col_output = 'resistencia'
        filter_col = 'classe_metrica'
        
        output = self.search_by_filter(table, col_output, filter_col, filtered)
        
        return  float(output[0]) if (output) else 129


if __name__ == '__main__':
    t = SGBD()
    print(t.filter_screw_materials())