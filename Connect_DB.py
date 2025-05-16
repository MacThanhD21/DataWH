import pyodbc
import pandas as pd
import random
from faker import Faker

fake = Faker()

# Function to generate data for Dim_RepresentativeOffice
def generate_dim_representative_office(n):
    data = []
    for i in range(1, n + 1):
        data.append({
            'CityId': int(i),
            'CityName': str(fake.city())[:255],
            'OfficeAddress': str(fake.address())[:255],
            'State': str(fake.state())[:255]
        })
    return pd.DataFrame(data)

# Function to generate data for Dim_Customer
def generate_dim_customer(n, city_ids):
    data = []
    for i in range(1, n + 1):
        data.append({
            'CustomerId': int(i),
            'CustomerName': str(fake.name())[:255],
            'CityId': int(random.choice(city_ids)),
            'CustomerType': str(random.choice(['Postal', 'Travel']))[:255]
        })
    return pd.DataFrame(data)

# Function to generate data for Dim_Item
def generate_dim_item(n):
    data = []
    for i in range(1, n + 1):
        data.append({
            'ItemId': int(i),
            'Description': str(fake.sentence()),
            'Size': str(fake.random_int(min=10, max=100))[:50],
            'Weight': int(fake.random_int(min=100, max=5000)),
            'Price': float(random.randint(1000, 50000))
        })
    return pd.DataFrame(data)

# Function to generate data for Dim_Time
def generate_dim_time(start_year, end_year):
    data = []
    id_counter = 1
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            quarter = (month - 1) // 3 + 1
            data.append({
                'TimeId': int(id_counter),
                'Month': int(month),
                'Quarter': int(quarter),
                'Year': int(year)
            })
            id_counter += 1
    return pd.DataFrame(data)

# Function to generate data for Fact_Sale
def generate_fact_sale(n, customer_df, item_df, time_df):
    data = []
    used_keys = set()
    
    time_ids = time_df['TimeId'].values.tolist()
    customer_ids = customer_df['CustomerId'].values.tolist()
    item_ids = item_df['ItemId'].values.tolist()
    
    attempts = 0
    while len(data) < n and attempts < n * 2:
        attempts += 1
        time_id = int(random.choice(time_ids))
        customer_id = int(random.choice(customer_ids))
        item_id = int(random.choice(item_ids))
        
        key = (time_id, customer_id, item_id)
        
        if key not in used_keys:
            used_keys.add(key)
            quantity = random.randint(1, 100)
            price = item_df.loc[item_df['ItemId'] == item_id, 'Price'].values[0]
            total_revenue = quantity * price
            
            data.append({
                'TimeId': time_id,
                'CustomerId': customer_id,
                'ItemId': item_id,
                'Quantity': quantity,
                'TotalRevenue': float(total_revenue)
            })
    
    return pd.DataFrame(data)

num_cities = 25
num_customers = 500
num_items = 150
num_fact_records = 2000


# Generate dimension data
dim_office_df = generate_dim_representative_office(num_cities)
dim_customer_df = generate_dim_customer(num_customers, dim_office_df['CityId'].tolist())
dim_item_df = generate_dim_item(num_items)
dim_time_df = generate_dim_time(2022, 2025)  # 6 years of data

# Generate fact data
fact_sale_df = generate_fact_sale(num_fact_records, dim_customer_df, dim_item_df, dim_time_df)

# SQL Server connection
server = 'DESKTOP-IBS55CP\DW'
database = 'DataWarehouse'
username = 'sa'
password = '123'
conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'

try:
    conn = pyodbc.connect(conn_str)
    print("Connection successful!")
    
    cursor = conn.cursor()

    # Delete existing data (if any)
    print("Deleting old data...")
    cursor.execute("DELETE FROM Fact_Sale")
    cursor.execute("DELETE FROM Dim_Time")
    cursor.execute("DELETE FROM Dim_Item")
    cursor.execute("DELETE FROM Dim_Customer")
    cursor.execute("DELETE FROM Dim_RepresentativeOffice")
    conn.commit()
    print("Old data deleted!")

    # Insert new data in proper order
    print("Inserting new data...")
    
    # 1. Insert Dim_RepresentativeOffice first
    for index, row in dim_office_df.iterrows():
        cursor.execute("""
            INSERT INTO Dim_RepresentativeOffice (CityId, CityName, OfficeAddress, State) 
            VALUES (?, ?, ?, ?)
        """, int(row['CityId']), str(row['CityName']), str(row['OfficeAddress']), str(row['State']))
    print("Dim_RepresentativeOffice inserted")
    
    # 2. Insert Dim_Customer
    for index, row in dim_customer_df.iterrows():
        cursor.execute("""
            INSERT INTO Dim_Customer (CustomerId, CustomerName, CityId, CustomerType) 
            VALUES (?, ?, ?, ?)
        """, int(row['CustomerId']), str(row['CustomerName']), int(row['CityId']), str(row['CustomerType']))
    print("Dim_Customer inserted")
    
    # 3. Insert Dim_Item
    for index, row in dim_item_df.iterrows():
        cursor.execute("""
            INSERT INTO Dim_Item (ItemId, Description, Size, Weight, Price) 
            VALUES (?, ?, ?, ?, ?)
        """, int(row['ItemId']), str(row['Description']), str(row['Size']), 
            int(row['Weight']), float(row['Price']))
    print("Dim_Item inserted")
    
    # 4. Insert Dim_Time
    for index, row in dim_time_df.iterrows():
        cursor.execute("""
            INSERT INTO Dim_Time (TimeId, Month, Quarter, Year) 
            VALUES (?, ?, ?, ?)
        """, int(row['TimeId']), int(row['Month']), int(row['Quarter']), int(row['Year']))
    print("Dim_Time inserted")

    # 5. Insert Fact_Sale
    for index, row in fact_sale_df.iterrows():
        cursor.execute("""
            INSERT INTO Fact_Sale (TimeId, CustomerId, ItemId, Quantity, TotalRevenue) 
            VALUES (?, ?, ?, ?, ?)
        """, int(row['TimeId']), int(row['CustomerId']), int(row['ItemId']), 
            int(row['Quantity']), float(row['TotalRevenue']))
    print("Fact_Sale inserted")
    
    conn.commit()
    print("All data successfully inserted into SQL Server!")
    
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    if 'conn' in locals():
        conn.close()
        print("Connection closed!")