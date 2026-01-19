import csv
import os

# Configuration
input_dir = r"c:\Users\Vince\Documents\Alobin ICT241\Track-My-Gains\fitness data"
output_file = r"c:\Users\Vince\Documents\Alobin ICT241\Track-My-Gains\populate_data.sql"
target_user_id = "0a17aa0e-65a0-41ad-a0af-b7ce6ba83fc4"
placeholder_id = "REPLACE_WITH_NEW_USER_UUID"

def escape_sql_string(value):
    if value is None:
        return "NULL"
    # Basic SQL escaping: replace single quote with two single quotes
    return "'" + str(value).replace("'", "''") + "'"

def generate_inserts():
    with open(output_file, 'w', encoding='utf-8') as f_out:
        f_out.write("-- SQL Script to populate data\n")
        f_out.write(f"-- IMPORTANT: Replace '{placeholder_id}' with your actual new Supabase User UID before running.\n")
        f_out.write("-- You can find your User UID in the Supabase Authentication Dashboard.\n\n")

        # 1. Weekly Plan (Do this first as other tables might refer to it? No, other tables refer to users)
        # Actually logic doesn't strictly matter for these independent tables (except user_id FK)
        
        # weekly_plan
        file_path = os.path.join(input_dir, "weekly_plan_rows.csv")
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f_in:
                reader = csv.DictReader(f_in)
                for row in reader:
                    if row['user_id'] == target_user_id:
                        # user_id,plan,updated_at
                        plan = escape_sql_string(row['plan'])
                        updated_at = escape_sql_string(row['updated_at'])
                        
                        sql = f"INSERT INTO public.weekly_plan (user_id, plan, updated_at) VALUES ('{placeholder_id}', {plan}, {updated_at});\n"
                        f_out.write(sql)
        f_out.write("\n")

        # sessions
        file_path = os.path.join(input_dir, "sessions_rows.csv")
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f_in:
                reader = csv.DictReader(f_in)
                for row in reader:
                    if row['user_id'] == target_user_id:
                        # id,user_id,title,date,exercises,created_at
                        # We use the original ID to maintain consistency if needed, or generate new ones? 
                        # User wants to "migrate", keeping history. Better to keep IDs if UUIDs.
                        row_id = escape_sql_string(row['id']) # it's uuid
                        title = escape_sql_string(row['title'])
                        date = escape_sql_string(row['date'])
                        exercises = escape_sql_string(row['exercises'])
                        created_at = escape_sql_string(row['created_at'])
                        
                        sql = f"INSERT INTO public.sessions (id, user_id, title, date, exercises, created_at) VALUES ({row_id}, '{placeholder_id}', {title}, {date}, {exercises}, {created_at});\n"
                        f_out.write(sql)
        f_out.write("\n")

        # daily_nutrition
        file_path = os.path.join(input_dir, "daily_nutrition_rows.csv")
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f_in:
                reader = csv.DictReader(f_in)
                for row in reader:
                    if row['user_id'] == target_user_id:
                         # id,user_id,date,meal_name,calories,protein,carbs,fats,foods,created_at
                        row_id = escape_sql_string(row['id'])
                        date = escape_sql_string(row['date'])
                        meal_name = escape_sql_string(row['meal_name'])
                        calories = row['calories'] if row['calories'] else "0"
                        protein = row['protein'] if row['protein'] else "0"
                        carbs = row['carbs'] if row['carbs'] else "0"
                        fats = row['fats'] if row['fats'] else "0"
                        foods = escape_sql_string(row['foods'])
                        created_at = escape_sql_string(row['created_at'])

                        sql = f"INSERT INTO public.daily_nutrition (id, user_id, date, meal_name, calories, protein, carbs, fats, foods, created_at) VALUES ({row_id}, '{placeholder_id}', {date}, {meal_name}, {calories}, {protein}, {carbs}, {fats}, {foods}, {created_at});\n"
                        f_out.write(sql)
        f_out.write("\n")

if __name__ == "__main__":
    generate_inserts()
    print("SQL generation complete.")
