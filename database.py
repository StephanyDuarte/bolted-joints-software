import mysql.connector
from mysql.connector import Error
import math


class Database:
    def __init__(self, db_name, password):
        self.db_name = db_name
        self.user_password = password
        self.user_name = 'root'
        self.host_name = 'localhost'

        
    # def create_server_connection(host_name, user_name, user_password):
    def create_server_connection(self):
        connection = None
        try:
            connection = mysql.connector.connect(
                host=self.host_name,
                user=self.user_name,
                passwd=self.user_password
            )
            print("MySQL Database connection successful")
        except Error as err:
            print(f"Error: '{err}'")

        return connection


    @staticmethod
    def create_database(connection, query):
        cursor = connection.cursor()
        try:
            cursor.execute(query)
            print("Database created successfully")
        except Error as err:
            print(f"Error: '{err}'")
            
            
    # def create_db_connection(host_name, user_name, user_password, db_name):
    def create_db_connection(self):
        connection = None
        try:
            connection = mysql.connector.connect(
                host= self.host_name,
                user= self.user_name,
                passwd= self.user_password,
                database= self.db_name
            )
            print("MySQL Database connection successful")
        except Error as err:
            print(f"Error: '{err}'")
        return connection


    @staticmethod
    def execute_query(connection, query):
        cursor = connection.cursor()
        try:
            cursor.execute(query)
            connection.commit()
            print("Query successful")
        except Error as err:
            print(f"Error: '{err}'")


    @staticmethod
    def read_query(connection, query):
        cursor = connection.cursor()
        result = None
        try:
            cursor.execute(query)
            result = cursor.fetchall()
            return result
        except Error as err:
            print(f"Error: '{err}'")


if __name__ == '__main__':
    pw = 'SENHA'
    db_name = "bj_software"
    db = Database(db_name, pw)
    q1 = """
    SELECT dim_screw, pitch, traction_area
    FROM metric_threads
    WHERE metric_threads.threads_id = 8;
    """
    connection = db.create_db_connection()
    results = db.read_query(connection, q1)
    print(results)
    for result in results:
        print(result)
    dim, pitch, a_t = result
    
    q2= f"""
    SELECT height_nut
    FROM hex_nuts
    WHERE hex_nuts.dim_nuts = {results[0][0]}
    """
    print(q2)
    results = db.read_query(connection, q2)
    print(results)
    for result in results:
        print(result)
    h_nut = result[0]
    qtd_nuts = 1
    q3= f"""
    SELECT elasticity
    FROM stiffness_materials
    WHERE stiffness_materials.material = 'Aço'
    """
    print(q3)
    results = db.read_query(connection, q3)
    print(results)
    for result in results:
        print(result)     
    E = result[0]
        
    
    
    qtd_washers = 0
    espessura_washers = 0
    total_chapas = 450
    
    total_l = total_chapas + (2*pitch) + (h_nut * qtd_nuts) + (qtd_washers*espessura_washers)
    if total_l<= 125:
        spare = 6
    elif total_l<= 200:
        spare = 12
    else:
        spare = 25
    l_t_cap  = (2 * dim) + spare
    l_d  = float(total_l - l_t_cap)
    l_t = float(total_chapas - l_d)
    a_d = 0.25 * (math.pi) * (dim**2)
    a_t = float(a_t)
    kp = (a_d * a_t * E)/ ((a_d *l_t) + (a_t * l_d))
    print()
    "calcular kp"
        
        
    
    
    
    
        
        
    

"""    connection = create_server_connection("localhost", "root", pw)
    create_db = f"CREATE DATABASE IF NOT EXISTS {db}"
    create_database(connection, create_db)
    connection = create_db_connection("localhost", "root", pw, db)"""
    
    
    