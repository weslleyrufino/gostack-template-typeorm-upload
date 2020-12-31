import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Category from "./Category";

@Entity("transactions")// AQUI SE REFERE AO NOME DA TABELA DO BANCO DE DADOS!!! OU SEJA, PRECISA ESTAR IGUAL AO NOME DA TABELA NO BANCO.
class Transaction {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column()
  value: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;
}

export default Transaction;
